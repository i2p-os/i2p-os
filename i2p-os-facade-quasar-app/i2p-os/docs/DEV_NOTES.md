Окей: **“вмонтировать и вызвать C++ i2pd в Quasar”** = кроссплатформенный native bridge + Quasar/Capacitor/Node.

Разберём по платформам.

---

## 1️⃣ Desktop (Windows, Linux, macOS)

**Стратегия:** Electron + Node.js native addon (`N-API` / `node-gyp`)

**Шаги:**

1. Сборка i2pd как **статическая / динамическая библиотека**:

```bash
# Linux/macOS
cmake -B build -S . -DBUILD_SHARED_LIBS=ON
make -C build
# Windows через MSVC + CMake
```

2. Создать Node native addon (`.node`):

```bash
napi-create myi2pd
# В C++ подключаем libi2pd
#include "i2pd.h"
Napi::Value startI2PD(const Napi::CallbackInfo& info) {
    // вызов функции i2pd
}
```

3. В Quasar (Electron) вызываем через Node bridge:

```js
const i2pd = require('myi2pd.node');
i2pd.startI2PD();
```

✅ Всё работает на Desktop, full access к i2pd API.

---

## 2️⃣ Android

**Стратегия:** Capacitor / Cordova + JNI + NDK

**Шаги:**

1. Скомпилировать i2pd как **shared library** (`.so`) через NDK.
2. Создать **Java/Kotlin wrapper**:

```java
public class I2pdBridge {
    static { System.loadLibrary("i2pd"); }
    public native void startI2PD();
}
```

3. В C++ JNI:

```cpp
extern "C"
JNIEXPORT void JNICALL
Java_com_example_i2pd_I2pdBridge_startI2PD(JNIEnv*, jobject) {
    i2pd::Start();
}
```

4. Quasar → Capacitor plugin → вызывает Java bridge:

```ts
import { Capacitor } from '@capacitor/core';
Capacitor.Plugins.I2pdBridge.startI2PD();
```

⚠️ Ограничения: нужен **TUN/VpnService** для полноценного i2p-трафика.

---

## 3️⃣ iOS

**Стратегия:** Objective-C / Swift + C++ (Objective-C++ `.mm` файлы)

**Шаги:**

1. Скомпилировать i2pd как **static library** (`.a`) для arm64 + x86_64 (симулятор).
2. Создать Objective-C++ wrapper:

```objc
@interface I2PDWrapper : NSObject
- (void)startI2PD;
@end

@implementation I2PDWrapper
- (void)startI2PD {
    i2pd::Start();
}
@end
```

3. Capacitor plugin → вызывает Objective-C bridge:

```ts
Capacitor.Plugins.I2pdWrapper.startI2PD();
```

⚠️ Ограничения: iOS не разрешает arbitrary network stack в sandbox → возможно, только **local proxy / remote daemon**.

---

## 4️⃣ Унифицированный UX в Quasar

Идея: **один Quasar frontend → разные нативные адаптеры под платформу**.

```
Quasar Vue (UI)
      |
      |---- Desktop: Node N-API addon -> i2pd lib
      |
      |---- Android: Capacitor plugin -> JNI -> i2pd.so
      |
      |---- iOS: Capacitor plugin -> Objective-C++ -> i2pd.a
```

👉 Frontend не знает про детали реализации, просто вызывает `start() / stop() / status()`.

---

## 5️⃣ Резюме

| Platform            | Вариант                    | Комментарий                                    |
| ------------------- | -------------------------- | ---------------------------------------------- |
| Windows/Linux/macOS | Node native addon          | Полный доступ, проще собрать                   |
| Android             | JNI + NDK                  | Можно встроить, нужен VpnService               |
| iOS                 | Objective-C++ + static lib | Ограничено sandbox, иногда нужен remote daemon |
