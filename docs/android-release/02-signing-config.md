# Android 应用签名配置指南

## 🔐 签名说明

Android 应用必须使用数字证书签名后才能发布到 Google Play。签名用于：
- 验证应用来源
- 确保应用完整性
- 支持应用更新

---

## 📋 签名方式选择

### 方式一：EAS Build（推荐）

**优势：**
- 云端管理签名密钥
- 自动处理签名流程
- 支持团队协作
- 密钥安全存储

**配置步骤：**

1. **登录 EAS**
   ```bash
   npx eas-cli login
   ```

2. **配置 EAS 签名**
   ```bash
   npx eas-cli build:configure
   ```

3. **自动生成签名**
   EAS 会自动生成并管理签名密钥

---

### 方式二：本地签名

**适用场景：**
- 需要完全控制签名密钥
- 离线构建
- 企业内部分发

**配置步骤：**

#### 1. 生成签名密钥库

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore healthora-fit.keystore -alias healthora-fit -keyalg RSA -keysize 2048 -validity 10000
```

**参数说明：**
- `healthora-fit.keystore`：密钥库文件名
- `healthora-fit`：密钥别名
- `validity 10000`：有效期（天）

**交互输入：**
```
Enter keystore password: [输入密码]
Re-enter new password: [确认密码]
What is your first and last name? [Your Name]
What is the name of your organizational unit? [Unit]
What is the name of your organization? [Organization]
What is the name of your City or Locality? [City]
What is the name of your State or Province? [State]
What is the two-letter country code for this unit? [CN]
```

#### 2. 创建签名配置文件

创建 `android/keystore.properties`：

```properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=healthora-fit
storeFile=healthora-fit.keystore
```

**⚠️ 安全提示：**
- 不要将 `keystore.properties` 提交到 Git
- 将 `*.keystore` 文件添加到 `.gitignore`

#### 3. 配置 Gradle

编辑 `android/app/build.gradle`：

```gradle
android {
    ...
    
    signingConfigs {
        release {
            if (project.hasProperty('keystore.properties')) {
                def props = new Properties()
                props.load(new FileInputStream(file('keystore.properties')))
                storeFile file(props['storeFile'])
                storePassword props['storePassword']
                keyAlias props['keyAlias']
                keyPassword props['keyPassword']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 4. 生成签名 APK/AAB

```bash
# 生成 APK
cd android && ./gradlew assembleRelease

# 生成 AAB（推荐，用于 Google Play）
cd android && ./gradlew bundleRelease
```

---

## 🔧 EAS Build 配置详解

### eas.json 配置

创建或更新 `eas.json`：

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-services.json",
        "track": "internal"
      }
    }
  }
}
```

### 构建命令

```bash
# 开发构建（APK）
npx eas-cli build --platform android --profile development

# 预览构建（APK）
npx eas-cli build --platform android --profile preview

# 生产构建（AAB）
npx eas-cli build --platform android --profile production

# 提交到 Google Play
npx eas-cli submit --platform android
```

---

## 🔒 密钥管理最佳实践

### 安全存储

1. **本地开发**
   - 将 `*.keystore` 文件存储在安全位置
   - 不要提交到版本控制
   - 使用环境变量存储密码

2. **团队协作**
   - 使用 EAS 管理共享密钥
   - 或使用密钥管理服务（如 AWS Secrets Manager）

3. **备份**
   - 备份密钥库文件和密码
   - 丢失密钥将无法更新应用

### 环境变量配置

创建 `.env.local`（不提交到 Git）：

```bash
KEYSTORE_PASSWORD=your_password
KEY_ALIAS=healthora-fit
KEY_PASSWORD=your_key_password
```

在代码中使用：

```typescript
// 不要在客户端代码中使用签名密钥
// 这些仅用于构建脚本
```

---

## ✅ 验证签名

### 检查 APK 签名

```bash
# 使用 apksigner
apksigner verify --print-certs your-app.apk

# 使用 keytool
keytool -printcert -jarfile your-app.apk
```

### 检查 AAB 签名

```bash
# 使用 jarsigner
jarsigner -verify -verbose -certs your-app.aab
```

---

## 📝 常见问题

### Q1: 忘记密钥密码怎么办？

**A:** 如果使用 EAS Build，可以重置密钥。如果是本地签名，密码无法恢复，需要：
1. 生成新密钥
2. 作为新应用发布（丢失所有用户和评分）

### Q2: 可以更改签名密钥吗？

**A:** 不可以。Google Play 不允许使用不同密钥更新应用。必须使用原始密钥。

### Q3: 如何迁移到 EAS 签名？

**A:**
1. 使用现有密钥库配置 EAS
2. 上传密钥库到 EAS
3. 后续构建自动使用 EAS 签名

---

## 📋 实施清单

- ⬜ 选择签名方式（EAS 或本地）
- ⬜ 生成签名密钥库
- ⬜ 配置签名信息
- ⬜ 测试签名构建
- ⬜ 备份密钥库和密码

---

*文档版本：v1.0*
*创建日期：2026-06-04*
