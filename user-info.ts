// 用户信息类型定义
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
  lastLoginAt?: Date;
}

// 模拟的 getUserInfo 函数
export async function getUserInfo(): Promise<UserInfo> {
  // 模拟异步获取用户信息
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: '12345',
        username: 'john_doe',
        email: 'john@example.com',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        role: 'user',
        createdAt: new Date('2023-01-01'),
        lastLoginAt: new Date('2024-01-15')
      });
    }, 100);
  });
}

// 获取用户信息的主要函数
export async function getAuthUserInfo(authUserInfo?: UserInfo | null): Promise<UserInfo> {
  // 如果 authUserInfo 有值，直接返回
  if (authUserInfo) {
    return authUserInfo;
  }
  
  // 如果 authUserInfo 没有值，从 getUserInfo 函数中获取
  try {
    const userInfo = await getUserInfo();
    return userInfo;
  } catch (error) {
    throw new Error(`Failed to fetch user info: ${error}`);
  }
}

// 同步版本的获取用户信息函数（如果 authUserInfo 有值）
export function getAuthUserInfoSync(authUserInfo?: UserInfo | null): UserInfo | null {
  if (authUserInfo) {
    return authUserInfo;
  }
  
  // 同步版本无法调用异步的 getUserInfo，返回 null 或抛出错误
  return null;
}

// 带缓存的版本
class UserInfoCache {
  private cache: UserInfo | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  async getAuthUserInfo(authUserInfo?: UserInfo | null): Promise<UserInfo> {
    // 如果 authUserInfo 有值，更新缓存并返回
    if (authUserInfo) {
      this.cache = authUserInfo;
      this.cacheTime = Date.now();
      return authUserInfo;
    }

    // 检查缓存是否有效
    const now = Date.now();
    if (this.cache && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.cache;
    }

    // 从 getUserInfo 获取并缓存
    try {
      const userInfo = await getUserInfo();
      this.cache = userInfo;
      this.cacheTime = now;
      return userInfo;
    } catch (error) {
      throw new Error(`Failed to fetch user info: ${error}`);
    }
  }

  clearCache(): void {
    this.cache = null;
    this.cacheTime = 0;
  }
}

// 导出缓存实例
export const userInfoCache = new UserInfoCache();

// 示例使用
export async function exampleUsage() {
  // 情况1: authUserInfo 有值
  const existingUserInfo: UserInfo = {
    id: '67890',
    username: 'jane_doe',
    email: 'jane@example.com',
    name: 'Jane Doe',
    role: 'admin',
    createdAt: new Date('2023-06-01')
  };

  const userInfo1 = await getAuthUserInfo(existingUserInfo);
  console.log('从现有 authUserInfo 获取:', userInfo1);

  // 情况2: authUserInfo 没有值，从 getUserInfo 获取
  const userInfo2 = await getAuthUserInfo();
  console.log('从 getUserInfo 获取:', userInfo2);

  // 情况3: 使用缓存版本
  const userInfo3 = await userInfoCache.getAuthUserInfo();
  console.log('使用缓存获取:', userInfo3);
}