import { 
  UserInfo, 
  getAuthUserInfo, 
  getAuthUserInfoSync, 
  userInfoCache,
  getUserInfo 
} from './user-info';

// 测试用例
async function runTests() {
  console.log('=== 用户信息获取测试 ===\n');

  // 测试1: authUserInfo 有值的情况
  console.log('测试1: authUserInfo 有值');
  const mockAuthUserInfo: UserInfo = {
    id: 'test-123',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date('2024-01-01')
  };

  try {
    const result1 = await getAuthUserInfo(mockAuthUserInfo);
    console.log('✅ 成功获取现有用户信息:', {
      id: result1.id,
      username: result1.username,
      email: result1.email
    });
  } catch (error) {
    console.log('❌ 测试1失败:', error);
  }

  console.log('\n---\n');

  // 测试2: authUserInfo 为 null/undefined，从 getUserInfo 获取
  console.log('测试2: authUserInfo 为空，从 getUserInfo 获取');
  try {
    const result2 = await getAuthUserInfo();
    console.log('✅ 成功从 getUserInfo 获取用户信息:', {
      id: result2.id,
      username: result2.username,
      email: result2.email
    });
  } catch (error) {
    console.log('❌ 测试2失败:', error);
  }

  console.log('\n---\n');

  // 测试3: 同步版本测试
  console.log('测试3: 同步版本');
  const syncResult = getAuthUserInfoSync(mockAuthUserInfo);
  if (syncResult) {
    console.log('✅ 同步版本成功:', {
      id: syncResult.id,
      username: syncResult.username
    });
  } else {
    console.log('ℹ️ 同步版本返回 null（authUserInfo 为空时）');
  }

  console.log('\n---\n');

  // 测试4: 缓存版本测试
  console.log('测试4: 缓存版本');
  try {
    // 第一次调用，应该从 getUserInfo 获取
    const cacheResult1 = await userInfoCache.getAuthUserInfo();
    console.log('✅ 缓存版本第一次调用:', {
      id: cacheResult1.id,
      username: cacheResult1.username
    });

    // 第二次调用，应该从缓存获取
    const cacheResult2 = await userInfoCache.getAuthUserInfo();
    console.log('✅ 缓存版本第二次调用（应该来自缓存）:', {
      id: cacheResult2.id,
      username: cacheResult2.username
    });

    // 清除缓存
    userInfoCache.clearCache();
    console.log('✅ 缓存已清除');
  } catch (error) {
    console.log('❌ 缓存测试失败:', error);
  }

  console.log('\n---\n');

  // 测试5: 类型检查
  console.log('测试5: 类型检查');
  try {
    const userInfo: UserInfo = await getAuthUserInfo();
    
    // 验证返回的对象符合 UserInfo 类型
    const typeCheck = {
      hasId: typeof userInfo.id === 'string',
      hasUsername: typeof userInfo.username === 'string',
      hasEmail: typeof userInfo.email === 'string',
      hasName: typeof userInfo.name === 'string',
      hasRole: ['admin', 'user', 'guest'].includes(userInfo.role),
      hasCreatedAt: userInfo.createdAt instanceof Date
    };

    console.log('✅ 类型检查结果:', typeCheck);
    
    const allTypesCorrect = Object.values(typeCheck).every(Boolean);
    console.log(allTypesCorrect ? '✅ 所有类型检查通过' : '❌ 类型检查失败');
  } catch (error) {
    console.log('❌ 类型检查失败:', error);
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };