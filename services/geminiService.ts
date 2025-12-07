
import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseStudentDataFromText = async (text: string): Promise<Partial<Student>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract student tuition information from the following text.
      Return a JSON array of objects.
      
      Fields to extract:
      - name (string)
      - className (string, optional)
      - baseFee (number, monthly tuition)
      - absentDays (number, count of days absent)
      - deductionPerDay (number, amount to deduct per absent day)
      - previousDebt (number, unpaid amount from previous months)
      - otherFee (number, extra costs like books, materials)
      - note (string, optional details)

      If a value is missing, use reasonable defaults:
      - baseFee: 0 if not found
      - absentDays: 0
      - deductionPerDay: 0
      - previousDebt: 0
      - otherFee: 0

      Text to parse:
      "${text}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              className: { type: Type.STRING },
              baseFee: { type: Type.NUMBER },
              absentDays: { type: Type.NUMBER },
              deductionPerDay: { type: Type.NUMBER },
              previousDebt: { type: Type.NUMBER },
              otherFee: { type: Type.NUMBER },
              note: { type: Type.STRING },
            },
            required: ["name", "baseFee"],
          },
        },
      },
    });

    const result = JSON.parse(response.text || "[]");
    return result;
  } catch (error) {
    console.error("Error parsing with Gemini:", error);
    return [];
  }
};

export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url part
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const parsePaymentReceipt = async (base64Image: string): Promise<any> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: "image/jpeg", // Assuming jpeg or png, generic handling
                            data: base64Image
                        }
                    },
                    {
                        text: "Analyze this payment receipt image. Extract the transfer amount, date, and possible sender name or content."
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        amount: { type: Type.NUMBER },
                        date: { type: Type.STRING, description: "YYYY-MM-DD format" },
                        possibleName: { type: Type.STRING },
                        confidence: { type: Type.STRING, description: "High, Medium, or Low" }
                    }
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error("Error parsing receipt:", error);
        return null;
    }
};

export const generatePaymentReminder = async (student: Student, daysLate: number): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Write a polite and professional payment reminder message (in Vietnamese) for a student parent.
            Student Name: ${student.name}
            Parent Name: ${student.parentName}
            Amount Due: ${Math.abs(student.balance || 0)}
            Days Late: ${daysLate}
            
            Keep it short, friendly but firm. Suggest checking the attached invoice if applicable.
            `,
        });
        return response.text || "";
    } catch (error) {
        console.error("Error generating reminder:", error);
        return "Xin chào, vui lòng thanh toán học phí cho em " + student.name + ". Xin cảm ơn.";
    }
};
