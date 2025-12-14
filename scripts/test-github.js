#!/usr/bin/env node

/**
 * Script để test GitHub API connection
 * Sử dụng: node scripts/test-github.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testGitHubConnection() {
  console.log('\n🧪 GitHub Connection Tester cho SmartTuition\n');
  console.log('=' .repeat(50));
  
  try {
    // Nhập thông tin
    const token = await question('\n🔑 Nhập Personal Access Token: ');
    const owner = await question('👤 Nhập GitHub Username: ');
    const repo = await question('📁 Nhập Repository Name: ');
    const path = await question('📄 Nhập File Path (Enter = data/tuition_backup.json): ') || 'data/tuition_backup.json';
    
    console.log('\n⏳ Đang kiểm tra kết nối...\n');
    
    // Test 1: Kiểm tra repository
    console.log('1️⃣ Kiểm tra repository...');
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const repoRes = await fetch(repoUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        console.log('   ❌ Repository không tồn tại hoặc token không có quyền truy cập');
        console.log(`   💡 Kiểm tra: https://github.com/${owner}/${repo}`);
      } else if (repoRes.status === 401) {
        console.log('   ❌ Token không hợp lệ');
      } else {
        console.log(`   ❌ Lỗi ${repoRes.status}: ${repoRes.statusText}`);
      }
      rl.close();
      return;
    }
    
    const repoData = await repoRes.json();
    console.log('   ✅ Repository tồn tại');
    console.log(`   📦 Full name: ${repoData.full_name}`);
    console.log(`   🔒 Private: ${repoData.private ? 'Có' : 'Không'}`);
    console.log(`   📝 Description: ${repoData.description || 'Không có'}`);
    
    // Test 2: Kiểm tra file
    console.log('\n2️⃣ Kiểm tra file...');
    const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const fileRes = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (fileRes.status === 404) {
      console.log('   ⚠️  File chưa tồn tại (sẽ được tạo khi backup lần đầu)');
    } else if (fileRes.ok) {
      const fileData = await fileRes.json();
      console.log('   ✅ File đã tồn tại');
      console.log(`   📏 Size: ${(fileData.size / 1024).toFixed(2)} KB`);
      console.log(`   📅 Last modified: ${fileData.sha.substring(0, 7)}`);
    } else {
      console.log(`   ❌ Lỗi ${fileRes.status}: ${fileRes.statusText}`);
    }
    
    // Test 3: Kiểm tra quyền write
    console.log('\n3️⃣ Kiểm tra quyền ghi (write permission)...');
    const permissionsOk = repoData.permissions && (repoData.permissions.push || repoData.permissions.admin);
    if (permissionsOk) {
      console.log('   ✅ Token có quyền ghi vào repository');
    } else {
      console.log('   ⚠️  Không thể xác định quyền (có thể do scope token)');
      console.log('   💡 Đảm bảo token có scope "repo"');
    }
    
    // Kết luận
    console.log('\n' + '='.repeat(50));
    console.log('✅ KẾT LUẬN: Cấu hình GitHub hợp lệ!');
    console.log('\n📋 Thông tin để nhập vào SmartTuition:');
    console.log(`   Token: ${token.substring(0, 10)}...`);
    console.log(`   Owner: ${owner}`);
    console.log(`   Repo: ${repo}`);
    console.log(`   Path: ${path}`);
    console.log('\n🎉 Bạn có thể sử dụng "Lưu lên GitHub" trong ứng dụng!');
    
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.log('\n💡 Kiểm tra:');
    console.log('   - Kết nối internet');
    console.log('   - Token đúng định dạng (bắt đầu bằng ghp_)');
    console.log('   - Username và repo name chính xác');
  } finally {
    rl.close();
  }
}

// Run
testGitHubConnection();
