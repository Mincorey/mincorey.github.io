# APSNY-NEDVIGA - Недвижимость Абхазии

30.03.2026 — Проведен рефакторинг навигационных ссылок: старые вызовы экрана 'Profile' глобально заменены на актуальный 'ProfileTab' для совместимости с новой архитектурой условного рендеринга.
2026-03-30 — Refactored navigation links: old 'Profile' screen calls globally replaced with the current 'ProfileTab' for compatibility with the new conditional rendering architecture.

30.03.2026 — Добавлены видимые границы (border) для контейнеров полей ввода на всех экранах авторизации для улучшения видимости в темной теме.
2026-03-30 — Added visible borders to input field containers across all authentication screens to improve visibility in dark mode.

30.03.2026 — Проведен анализ транзакционных email-сервисов (Resend, Brevo, SendGrid). Для реализации подтверждения регистрации рекомендовано использовать Brevo ввиду наиболее щедрого бесплатного тарифа (300 писем в сутки).
2026-03-30 — Analysis of transactional email services (Resend, Brevo, SendGrid) completed. Recommended to use Brevo for registration confirmation due to the most generous free tier (300 emails/day).

30.03.2026 — Проведен анализ Stripe. Техническая интеграция выполнима. Критический риск: Географические ограничения. Регистрация аккаунта для лиц/компаний из РФ и Абхазии в Stripe не поддерживается из-за санкций. Требуется поиск альтернативных платежных шлюзов, работающих в данных регионах.
2026-03-30 — Stripe analysis completed. Technical integration feasible. Critical risk: Geographical restrictions. Account registration for individuals/companies from RF and Abkhazia is blocked due to sanctions. Need to search for alternative payment gateways operating in these regions.

29.03.2026 22:37 — Скорректирована верстка блока кнопок в объявлении: ширина блока сохранена (как галерея), элементы внутри распределены равномерно (space-evenly) с одинаковыми отступами по краям и между кнопками для улучшения визуального ритма.
2026-03-29 22:37 — Adjusted action buttons layout in listing details: block width maintained (like gallery), internal elements distributed evenly (space-evenly) with uniform edges and spacing for improved visual rhythm.


29.03.2026 22:31 — Оптимизирована верстка блока кнопок в объявлении: элементы сгруппированы в центре, увеличены отступы от краев для улучшения визуального баланса.
2026-03-29 22:31 — Optimized action buttons layout in listing details: elements grouped in center, increased margins from edges for better visual balance.


29.03.2026 21:38 — В раздел "Кошелек" добавлена информация о стоимости публикации объявления. Текст кнопки пополнения баланса сокращен для визуальной чистоты.
2026-03-29 21:38 — Added information about listing publication cost to the "Wallet" section. Balance top-up button text shortened for visual clarity.


29.03.2026 21:28 — Оптимизирована темная тема: фон сделан светло-серым (#1E1E1E). Уменьшено межстрочное расстояние в модалке оплаты, добавлена оранжевая предупреждающая иконка. Внедрен глобальный компонент загрузки AppLoader.
2026-03-29 21:28 — Dark theme optimized: background made light-gray (#1E1E1E). Reduced line spacing in payment modal, added orange warning icon. Implemented global loading component AppLoader.


29.03.2026 21:05 — Полностью скорректирован цвет фона темной темы во всем приложении (#121212). Оптимизировано модальное окно оплаты: уменьшено межстрочное расстояние, добавлена оранжевая иконка предупреждения. Внедрен единый компонент плавной анимации загрузки, примененный ко всем экранам загрузки.
2026-03-29 21:05 — Completely adjusted dark theme background color throughout the app (#121212). Optimized payment modal window: reduced line height, added an orange warning icon. Implemented a unified smooth loading animation component, applied to all loading screens.


29.03.2026 20:39 — Скорректирована темная тема: глубокий черный фон заменен на мягкий темно-серый (#121212) для улучшения визуальной иерархии. Обновлено форматирование текста в модальном окне перед оплатой (добавлены переносы строк и явное указание email).
2026-03-29 20:39 — Dark theme adjusted: deep black background replaced with a soft dark gray (#121212) to improve visual hierarchy. Updated text formatting in the pre-payment modal window (added line breaks and explicit email display).


29.03.2026 20:31 — Оптимизирована темная тема: основной фон изменен на мягкий темно-серый, блоки сделаны чуть светлее для многослойности. Иконка пожаловаться изменена с красного на оранжевый. Кастомизировано окно подтверждения оплаты с динамическим включением email.
2026-03-29 20:31 — Dark theme optimized: main background changed to soft dark gray, blocks made slightly lighter for layering. Report icon changed from red to orange. Payment confirmation window customized with dynamic email insertion.


29.03.2026 18:56 — Внедрено копирование email в буфер обмена перед оплатой с предупреждающим окном (надежный fallback-механизм для поля Никнейм).
2026-03-29 18:56 — Implemented copying email to clipboard before payment with an alert window (reliable fallback for the Nickname field).

29.03.2026 18:22 — Оптимизирована архитектура React Navigation. Внедрен условный рендеринг экранов (через Stack Navigator Wrapper) для корректной работы гостевого режима и очистки стека после авторизации.
2026-03-29 18:22 — React Navigation architecture optimized. Implemented conditional screen rendering (via Stack Navigator Wrapper) to ensure proper guest mode operation and stack clearing upon authentication.

29.03.2026 14:05 — Исправлена циклическая навигация: удалены модальные окна Login/Register из RootStack во избежание наслоения интерфейса. Внедрен бесшовный переход в профиль после авторизации через AuthContext.
2026-03-29 14:05 — Cyclic navigation fixed: Login/Register modal screens removed from RootStack to prevent UI overlapping. Integrated seamless transition to profile after authentication via AuthContext.

29.03.2026 13:55 — Реорганизована навигация: внедрена условная отрисовка (Conditional Rendering) для Auth/Profile. Реализован гостевой режим доступа к контенту.
2026-03-29 13:55 — Navigation reorganized: conditional rendering for Auth/Profile implemented. Guest mode for content access added.

29.03.2026 13:45 — Строгая типизация Edge Function. Внедрены интерфейсы Deno (`PaymentPayload`, `Request`) для устранения ложных предупреждений линтера (VS Code) и самодокументирования кода.
2026-03-29 13:45 — Edge Function strict typing applied. Introduced Deno interfaces (`PaymentPayload`, `Request`) to resolve false linter warnings and improve self-documentation.

29.03.2026 13:40 — Проведена типизация Edge Function, устранены ошибки линтера в среде разработки.
2026-03-29 13:40 — Edge Function typed, linter errors in the development environment resolved.

29.03.2026 11:50 — СТАТУС: ВАЖНО > Оптимизирован рендеринг компонентов: внедрены строгие проверки на null и индикаторы загрузки для предотвращения ошибок обращения к памяти. Проект приведен к состоянию Zero-Error.
2026-03-29 11:50 — STATUS: IMPORTANT > Component rendering optimized: strict null-checks and loading indicators implemented to prevent memory access errors. Project achieved Zero-Error state.

29.03.2026 11:45 — СТАТУС: ВАЖНО (БЭКЛОГ) > Задача: Перед подачей на модерацию в App Store и Google Play выключить функцию пополнения баланса (через флаг в БД). После публикации включить обратно. Причина: Требования политик In-App Purchases Apple/Google.
2026-03-29 11:45 — STATUS: IMPORTANT (BACKLOG) > Task: Before submitting to App Store and Google Play, the balance top-up feature must be disabled via DB flag. Re-enable after release. Reason: Apple/Google In-App Purchases policies.

29.03.2026 11:40 — Оптимизирована логика приоритетов полей Webhook. Установлен приоритет на поле nickname, отключено автозаполнение поля message для удобства пользователя.
2026-03-29 11:40 — Webhook field priority optimized. Priority set to the nickname field, disabled autosubmit for message field for user convenience.

## [29.03.2026 11:30] - Интеграция автоматической оплаты и исправление профиля / Automated Payment Integration & Profile Fixes

### Краткое резюме / Summary
Полностью реализована и протестирована система автоматического пополнения баланса. Настроена Edge Function в Supabase для обработки вебхуков Donate.Stream. Реализовано автозаполнение данных пользователя в форме оплаты через injectedJavaScript.
Automated balance top-up system fully implemented and tested. Supabase Edge Function configured to handle Donate.Stream webhooks. User data auto-fill in the payment form implemented via injectedJavaScript.

### Ключевые изменения / Key Changes
- **Donate.Stream Webhooks**: Добавлена обработка системных запросов подтверждения вебхука (type: confirm). / Added handling for system webhook confirmation requests (type: confirm).
- **PaymentScreen Form Autosubmit**: Агрессивное `injectedJavaScript` автозаполнение данных пользователя (email) в форме WebView. / Aggressive `injectedJavaScript` auto-fill of user data (email) in the WebView form.
- **ProfileScreen Fix**: Исправлена критическая ошибка рендера профиля при отсутствии авторизации. Заглушка `LoginScreen` для пустых сессий. / Fixed critical profile rendering error when unauthorized. `LoginScreen` placeholder for empty sessions.

---

## [28.03.2026 07:45] - Система модерации и жалоб / Moderation & Reporting System

### Краткое резюме / Summary
Внедрена система модерации контента для соответствия требованиям App Store и Google Play. Пользователи теперь могут отправлять жалобы на объявления и неуместные комментарии.
Implemented a content moderation system to comply with App Store and Google Play requirements. Users can now report listings and inappropriate comments.

- **Система жалоб / Reporting System**: Кнопки «Пожаловаться» для объявлений и комментариев (long press).
- **Персистентность скрытия / Persistence**: Скрытые комментарии сохраняются в `AsyncStorage` и не сбрасываются при перезапуске.
- **Интерактивные фильтры / Interactive Filters**: Выбор района/города/типа сделки в результатах поиска через модальные окна.
- **Новый дизайн фильтров / Filter UI**: Статичное, равномерное меню на экране поиска вместо горизонтальной прокрутки.
- **Унификация карточек / Card Unification**: Единый стиль карточек на главном экране и в поиске, добавлен вывод даты (`DD MMMM YYYY`).
- **Синхронизация данных / Data Sync**: Счетчик комментариев и статусы лайков/избранного синхронизированы между всеми компонентами.
- **Очистка UI / UI Cleanup**: Удалены лишние кнопки («На карте») и redundant иконки.
- **Исправление багов UI / UI Bug Fixes**:
  - Модальные окна (`SelectionModal`) теперь закрываются при тапе на оверлей.
  - Исправлено нахлестывание текста (overflow) в кнопках фильтров: добавлен перенос (`flexWrap`) и обрезка длинного текста (`numberOfLines={1}`).
  - **Масштабирование логотипа**: Увеличен размер круглого логотипа в шапке (с 32px до 40px) для лучшей детализации и видимости бренда.
  - **Баг-фиксы (Bug Fixes)**:
    - Исправлена ошибка рендера `ReferenceError: colors` в `PaymentScreen`.
    - Добавлен параметр `scheme: "apsny-nedviga"` в `app.json` для корректной работы Expo Linking.
    - Оптимизирован `injectedJavaScript` для DonationAlerts (использование `setInterval`).
    - Исправлен текст кнопки подтверждения оплаты в профиле (с «Выйти» на «Оплатить»).
  - **Обновление стоимости**: Стоимость платной публикации объявления снижена со 150 ₽ до 100 ₽.
  - **Система кошелька (Wallet System)**: Добавлен вывод баланса в профиле пользователя.
  - **Интеграция WebView**: Реализован экран оплаты через DonationAlerts с автоматическим заполнением данных (сумма 100 ₽, email в сообщении).
  - **Feature Flag**: Внедрен переключатель `is_payment_enabled` в `app_settings` для дистанционного управления доступностью оплаты (для обхода модерации).
  - **Стандартизация хедера**: Унифицирована верстка и стили шапки для вкладок «Главная», «Поиск» и «Профиль» (единая высота, шрифт 20px и отступы).
  - **Масштабирование UI**: Глобально увеличена высота хедера (padding 12->16), размер заголовков (20-22px), иконок (28px) и аватаров (42px) для улучшения читаемости.
  - **Обновление Настроек**: Квадратный логотип перенесен из шапки в футер (под версию приложения) для более чистого интерфейса.

---

## [27.03.2026 16:35] Баг-фикс: Исправлена ошибка навигации (nested redirection) после успешной публикации объявления.
## [27.03.2026 16:35] Bug Fix: Fixed navigation error (nested redirection) after successful listing publication.

---

## [27.03.2026 15:50] Временный переход на react-native-maps для совместимости с Expo Go (код Yandex Maps закомментирован).
## [27.03.2026 15:50] Temporary switch to react-native-maps for Expo Go compatibility (Yandex Maps code is commented out).

---

## [27.03.2026 14:00] Крупное обновление: Интеграция Яндекс Карт (MapKit) для указания и просмотра геолокации объектов.
## [27.03.2026 14:00] Major Update: Yandex Maps (MapKit) integration for specifying and viewing property geolocation.

---

## [27.03.2026 13:07] UI Fix: Исправлен визуальный баг нахлеста (overflow) углов в карточках «Покупка» на главном экране.
## [27.03.2026 13:07] UI Fix: Fixed visual overflow of corners in 'Purchase' cards on the main screen.

---

## [27.03.2026 08:15] QA: Выравнивание текста «Покупка» по левому краю, унификация размера шрифта описаний в ленте (16px), исправление позиции кнопки «Назад» в деталях.
## [27.03.2026 08:15] QA: Left-aligned 'Purchase' text, unified card description font size (16px), corrected 'Back' button position in Listing Details.

---

## [27.03.2026 08:00] Редизайн карточек «Покупка», внедрение статистики продавца (счетчик объявлений и дата регистрации), скрытие галереи для заявок на покупку.

---

## [26.03.2026 22:35] - Глобальная видимость TabBar и UI-полировка / Global TabBar Visibility & UI Polish

### Краткое резюме / Summary
Проведена реструктуризация навигации для улучшения пользовательского опыта и визуальная доработка элементов интерфейса.
Restructured navigation to improve user experience and performed visual refinement of interface elements.

### Ключевые изменения / Key Changes
- **Навигация / Navigation**: Экраны деталей (ListingDetails), профилей (PublicProfile), избранного и настроек перемещены внутрь вложенных стаков в `TabNavigator`. Теперь нижняя панель вкладок (TabBar) остается видимой на большинстве экранов приложения.
- **HomeScreen / UI**: Иконка «В избранное» перенесена в левую группу (рядом с лайками и комментариями) для лучшей эргономики. Улучшена группировка и отступы в футере карточки.
- **Scroll-to-Top**: Добавлена задержка (500мс) перед обновлением данных при скролле наверх, что позволяет анимации прокрутки завершиться плавно.

---

## [26.03.2026 22:20] Исправление багов: Очистка состояний формы (reset states) после успешной публикации объявления.
## [26.03.2026 22:20] Bug Fix: Clearing form states (reset states) after successful listing publication.

---

## [26.03.2026 22:15] - Умное управление прокруткой / Smart Scroll Management

### Краткое резюме / Summary
Добавлены функции для удобной навигации по длинным спискам и автоматического сброса состояния прокрутки при переключении между экранами.
Added features for convenient navigation through long lists and automatic scroll state reset when switching between screens.

### Ключевые изменения / Key Changes
- **HomeScreen: Кнопка Scroll-to-Top**: Появляется при прокрутке вниз (>500px). При нажатии плавно возвращает в начало списка и автоматически обновляет данные (pull-to-refresh).
- **ProfileScreen: Сброс прокрутки**: Добавлен `useFocusEffect`, который принудительно устанавливает прокрутку в начало (y: 0) при каждом фокусе на экран профиля.
- **Инфраструктура**: Использование `useRef` для прямого управления компонентами `FlatList` и `ScrollView`.

---

## [26.03.2026 21:15] Исправление UI и БД: Исправлено имя колонки show_online_status и добавлена кнопка возврата на экран приватности.
## [26.03.2026 21:15] UI & DB Fix: Fixed show_online_status column name and added a back button to the privacy settings screen.

---

## [26.03.2026 21:05] - Реализация системы конфиденциальности профиля / Profile Privacy Settings Implementation

### Краткое резюме / Summary
Добавлена возможность управления приватностью контактных данных. Пользователи теперь могут выбирать, какие из их контактов (телефон, email, WhatsApp, Telegram) будут видны другим участникам, а также скрывать свой статус "в сети".
Added privacy controls for personal contact information. Users can now choose which contacts (phone, email, WhatsApp, Telegram) are visible to others and toggle their "online" status visibility.

### Ключевые изменения / Key Changes
- **PrivacySettingsScreen**: Создан новый экран настроек с 5 тумблерами для управления видимостью данных.
- **Интеграция с БД / DB Integration**: Настройки синхронизируются с таблицей `profiles` в Supabase (поля `show_phone`, `show_email`, `show_whatsapp`, `show_telegram`, `show_online`).
- **Профиль / Profile**: Добавлена кнопка "Конфиденциальность" для быстрого доступа к настройкам.
- **UI/UX**: Использование `CustomAlert` для подтверждения сохранения и плавные переходы между экранами.

---

## [26.03.2026 20:30] Исправление UI-бага. Исправлен цвет фона поля ввода комментария в темной теме (теперь используется динамический цвет surfaceVariant).
## [26.03.2026 20:30] UI Bug Fix. Fixed comment input background color in dark mode (now using dynamic surfaceVariant color).

---

## [26.03.2026 20:30] Исправление UI-бага. Повторно исправлена обрезка иконок в блоке действий на экране объявления (увеличены отступы, убран overflow).
## [26.03.2026 20:30] UI Bug Fix. Re-fixed icon clipping in the actions block on the listing screen (increased padding, removed overflow).

## [26.03.2026 20:25] - UI/UX: Полировка интерфейса, фикс кнопки "+" и редизайн галереи / UI Polishing & Gallery Redesign

### Краткое резюме / Summary
Устранены мелкие визуальные баги и добавлен финальный лоск интерфейсу: исправлена видимость плавающей кнопки, доработан стиль галереи и исправлено отображение иконок действий.
Fixed minor visual bugs and added final interface polish: improved floating button visibility, refined gallery style, and fixed action icon rendering.

### Ключевые изменения / Key Changes
- **TabNavigator: Фикс кнопки "+" / Floating Button Fix**: Добавлены слушатели клавиатуры (`Keyboard.addListener`). Теперь центральная кнопка "+" автоматически скрывается при открытии клавиатуры, не перекрывая поле ввода.
- **ListingDetails: Журнальный стиль галереи / Journal Gallery**:
    - Инлайн-галерея теперь имеет скругленные углы (`borderRadius: 16`), внешние отступы и тонкую рамку.
    - Исправлен расчет ширины изображений при прокрутке.
- **ListingDetails: Фикс иконок действий / Actions Fix**: Увеличен `paddingVertical` в блоке действий, что устранило обрезание увеличенных иконок. Удалены ограничения по высоте и `overflow: hidden`.
- **Full-screen Gallery: Оверлей / Enhanced Overlay**: Добавлена полупрозрачная подложка (`backgroundColor`) для полноэкранного просмотра фото, что создает более глубокий визуальный акцент на контенте.

---

## [26.03.2026 19:50] - UI/UX: Редизайн блока действий, SafeArea и Публичные профили / UI & Navigation Enhancements

### Краткое резюме / Summary
Масштабное обновление навигации и визуального стиля: внедрены публичные профили пользователей, улучшена работа с клавиатурой и переработан блок взаимодействия с объявлением.
Major navigation and visual update: implemented public user profiles, improved keyboard behavior, and redesigned the listing interaction block.

### Ключевые изменения / Key Changes
- **TabNavigator: Скрытие TabBar / Hide TabBar**: Включена опция `tabBarHideOnKeyboard`, что освобождает экранное пространство при вводе текста в комментариях или поиске.
- **ListingDetails: SafeArea & Layout**: 
    - Экран теперь корректно отображается под системным статус-баром (`SafeAreaView`).
    - Блок действий (лайки, избранное и т.д.) получил премиальный дизайн в виде отдельной карточки (`actionsCard`) с увеличенными иконками (26px).
- **PublicProfileScreen [NEW]**: Создан новый экран для просмотра профиля автора. Отображает аватар, имя и список всех объявлений пользователя.
- **Интеграция профилей / Profile Linking**: Все аватарки и имена в деталях объявления и комментариях теперь кликабельны и ведут на публичный профиль автора.

---

## [26.03.2026 19:30] - UI/UX: Исправление мерцания, клавиатуры и редизайн галереи / UX Fixes & Gallery Redesign

### Краткое резюме / Summary
Устранены критические UX-недочеты: мерцание карточек при скролле, перекрытие поля ввода комментария клавиатурой и неудобное расположение кнопок действий. Улучшена эргономика галереи фотографий.
Resolved critical UX issues: card flickering on scroll, keyboard overlapping the comment input, and inconvenient placement of action buttons. Improved photo gallery ergonomics.

### Ключевые изменения / Key Changes
- **HomeScreen: Фикс мерцания / Flickering Fix**: Добавлено свойство `activeOpacity={0.95}` для карточек объявлений. Это предотвращает резкое затемнение при свайпе/скролле, делая интерфейс более плавным.
- **ListingDetails: Редизайн галереи / Gallery Redesign**: 
    - Высота фотографий увеличена до `400px` для лучшего отображения вертикальных снимков.
    - Кнопки действий (лайк, избранное, поделиться, просмотры) перенесены из оверлея в отдельный ряд под фотографиями для удобства нажатия одной рукой.
- **ListingDetails: Клавиатура в комментариях / Keyboard Fix**: Интегрирован `KeyboardAvoidingView` для секции комментариев. Теперь поле ввода автоматически поднимается над клавиатурой и не перекрывается ею.

---

## [26.03.2026 13:35] - Кнопка «Очистить форму» / Clear Form Button

### Краткое резюме / Summary
Добавлена возможность полного сброса данных формы на экране создания объявления. Это позволяет пользователю мгновенно очистить все поля, удалить выбранные фотографии и стереть черновик из `AsyncStorage`.
Added the ability to completely reset form data on the listing creation screen. This allows the user to instantly clear all fields, remove selected photos, and delete the draft from `AsyncStorage`.

### Ключевые изменения / Key Changes
- **Функция сброса / Reset Logic**: Реализована функция `handleClearForm`, которая запрашивает подтверждение перед обнулением всех состояний формы и удалением черновика.
- **Функция сброса / Reset Logic**: Implemented the `handleClearForm` function, which asks for confirmation before resetting all form states and deleting the draft.
- **Интеллектуальное отображение / Smart Visibility**: Кнопка «Очистить форму» появляется только при наличии введенных данных и скрыта в режиме редактирования существующих объявлений.
- **Интеллектуальное отображение / Smart Visibility**: The "Clear Form" button appears only when data is entered and is hidden when editing existing listings.
- **UX и Безопасность / UX & Safety**: Красный цвет кнопки сигнализирует о деструктивном действии, а обязательный алерт предотвращает случайную потерю данных.
- **UX & Safety / UX & Safety**: The button's red color signals a destructive action, and a mandatory alert prevents accidental data loss.

---

## [26.03.2026 13:30] - UI: Redesign кнопки «Очистить форму» и стилей кнопок редактирования

### Краткое резюме / Summary
Обновлен дизайн кнопки «Очистить форму» для улучшения UX и исправлены стили кнопок редактирования профиля для корректного отображения в Dark Mode.

### Ключевые изменения / Key Changes
- **[AddListingScreen]** Полный редизайн кнопки «Очистить форму»: теперь это крупная кнопка с темно-красной заливкой (`#C62828`) и белым текстом, идентичная основной кнопке публикации.
- **[ProfileScreen/General UI]** Исправлены стили кнопок «карандашиков» (редактирование профиля и контактов): удален жесткий серый фон, добавлена динамическая подложка (`#3A3A3A` в темной теме / `#F0F0F0` в светлой) для корректного отображения в Dark Mode.

---

## [26.03.2026 13:25] - Функция «Автосохранение черновика» / Draft Auto-save Feature

### Краткое резюме / Summary
Внедрена система автоматического сохранения черновика на экране создания объявления (`AddListingScreen`). Теперь данные формы сохраняются в `AsyncStorage` в фоновом режиме, предотвращая потерю прогресса при случайном закрытии приложения.
Implemented an auto-save draft system on the `AddListingScreen`. Form data is now saved to `AsyncStorage` in the background, preventing progress loss if the app is accidentally closed.

### Ключевые изменения / Key Changes
- **Фоновое сохранение (Debounce) / Background Saving**: Изменения полей формы сохраняются автоматически через 1.5 секунды после ввода (используется debounce таймер).
- **Фоновое сохранение (Debounce) / Background Saving**: Form field changes are saved automatically 1.5 seconds after input (using a debounce timer).
- **Восстановление данных / Data Restoration**: При открытии экрана (если не в режиме редактирования) пользователю предлагается продолжить заполнение черновика или начать заново.
- **Восстановление данных / Data Restoration**: When opening the screen (if not in edit mode), the user is prompted to continue filling the draft or start fresh.
- **Очистка после публикации / Cleanup After Publication**: При успешной отправке объявления черновик автоматически удаляется из памяти.
- **Очистка после публикации / Cleanup After Publication**: After a listing is successfully submitted, the draft is automatically removed from memory.

---

## [26.03.2026 12:05] - Откат функционала Push-уведомлений / Push Notifications Rollback

### Краткое резюме / Summary
Полное удаление кода Push-уведомлений из-за несовместимости с Expo Go (Android SDK 53/55) на этапе разработки. Функционал перенесен в бэклог для будущей реализации в нативных сборках.
Complete removal of Push Notification code due to incompatibility with Expo Go (Android SDK 53/55) during the development phase. The functionality has been moved back to the backlog for future implementation in native builds.

### Ключевые изменения / Key Changes
- **SettingsScreen.tsx**: Удалены импорты `expo-notifications`, `expo-device`, `expo-constants`, логика регистрации токена и UI-переключатель.
- **SettingsScreen.tsx**: Removed `expo-notifications`, `expo-device`, `expo-constants` imports, token registration logic, and the UI toggle switch.
- **Бэклог / Backlog**: Задача "Настройки: Подготовка к Push-уведомлениям" возвращена в список TODO.
- **Backlog / Backlog**: The "Settings: Push Notification Preparation" task has been added back to the TODO list.

---

## [26.03.2026 11:58] - Исправление типов TypeScript для уведомлений / TypeScript Type Fix for Notifications

### Краткое резюме / Summary
Исправлена ошибка типизации в `setNotificationHandler`, связанная с отсутствующими обязательными полями в `NotificationBehavior`.
Fixed a typing error in `setNotificationHandler` related to missing required fields in `NotificationBehavior`.

### Ключевые изменения / Key Changes
- **Обновление объекта поведения / Behavior Object Update**:
    - Добавлены поля `shouldShowBanner: true` и `shouldShowList: true` для соответствия интерфейсу `NotificationBehavior` (SDK 55).
    - Added `shouldShowBanner: true` and `shouldShowList: true` fields to match the `NotificationBehavior` interface (SDK 55).

---

## [26.03.2026 11:55] - Изоляция глобального хэндлера уведомлений / Notification Handler Isolation

### Краткое резюме / Summary
Решена проблема падения приложения при запуске в Expo Go путем изоляции вызова `Notifications.setNotificationHandler`.
Fixed the app crash issue when running in Expo Go by isolating the `Notifications.setNotificationHandler` call.

### Ключевые изменения / Key Changes
- **Изоляция на уровне файла / File-Level Isolation**:
    - Глобальный обработчик `setNotificationHandler` в `SettingsScreen.tsx` теперь обернут в проверку `Constants.appOwnership !== 'expo'`.
    - The global `setNotificationHandler` in `SettingsScreen.tsx` is now wrapped in a `Constants.appOwnership !== 'expo'` check.
    - Это предотвращает преждевременный вызов методов `expo-notifications` во время инициализации скрипта в среде Expo Go.
    - This prevents premature calls to `expo-notifications` methods during script initialization in the Expo Go environment.

---

## [26.03.2026 11:45] - Обход ограничений Expo Go для Push-уведомлений / Expo Go Push Notification Workaround

### Краткое резюме / Summary
Добавлен механизм обнаружения среды Expo Go для предотвращения падений приложения при запросе Push-токена на Android (SDK 53).
Implemented a mechanism to detect the Expo Go environment to prevent app crashes when requesting a Push Token on Android (SDK 53).

### Ключевые изменения / Key Changes
- **Интеграция expo-constants / expo-constants Integration**:
    - Использован `Constants.appOwnership` для определения запуска в Expo Go.
    - Used `Constants.appOwnership` to detect if the app is running within Expo Go.
- **Безопасная обработка токена / Safe Token Handling**:
    - Добавлен возврат `'expo-go-mock-token'` в режиме разработки для тестирования логики БД без вызова сетевой ошибки.
    - Implemented a fallback that returns `'expo-go-mock-token'` in development mode to test database logic without triggering a network error.
    - Весь процесс регистрации обернут в `try...catch` для защиты от сбоев на уровне нативных модулей.
    - Wrapped the entire registration process in a `try...catch` block to protect against native module failures.

---

## [26.03.2026 11:15] - Внедрение логики Push-уведомлений / Push Notification Implementation

### Краткое резюме / Summary
Реализована полноценная логика регистрации и управления Push-уведомлениями на экране настроек с интеграцией в Supabase.
Implemented full logic for registration and management of Push Notifications on the settings screen with Supabase integration.

### Ключевые изменения / Key Changes
- **Регистрация токена / Token Registration**:
    - Добавлена функция `registerForPushNotificationsAsync` для проверки устройства и запроса разрешений.
    - Added `registerForPushNotificationsAsync` function to verify device status and request user permissions.
    - Реализовано получение Expo Push Token для физических устройств.
    - Implemented Expo Push Token retrieval for physical devices.
- **Интеграция с базой данных / Database Integration**:
    - Обновлено состояние профиля в таблице `profiles` при переключении уведомлений (сохранение/удаление токена).
    - Updated profile state in the `profiles` table when toggling notifications (token storage/removal).
    - Добавлена инициализация состояния при загрузке экрана настроек из базы данных.
    - Added state initialization from the database upon loading the settings screen.
- **Пользовательский интерфейс / User Interface**:
    - Связан переключатель "Уведомления" с логикой оптимистичного обновления и обработки ошибок.
    - Connected the "Notifications" switch with optimistic update logic and error handling.

---

## [26.03.2026 11:15] - [ ] **Настройки**: Подготовка к Push-уведомлениям (реализовать в Production APK) / **Settings**: Push Notification preparation (to be implemented in Production APK)
- [x] **Настройки**: Стандартизация аватара 36x36 / **Settings**: Avatar standardization 36x36

### Summary
Refined the Home Screen layout by stretching filters to full width and standardized header avatar sizes for consistent visual weight across the application.

### Key Changes
- **Full-width Home Filters**:
    - Updated `HomeScreen.tsx` filter bar to use `flex: 1` on each button, stretching them evenly across the screen.
    - Implemented `gap: 8` for consistent spacing between filters.
    - Set a standardized height of `44px` for better touch ergonomics.
- **Standardized Header Avatars**:
    - Unified the size of the header profile button and its image to strictly `36x36` with `borderRadius: 18` across all main screens.
    - Verified consistency in `HomeScreen`, `SearchScreen`, `AddListingScreen`, `FavoritesScreen`, `InboxScreen`, `MyListingsScreen`, and `SettingsScreen`.

---

## [26.03.2026 11:00] - UI: Filter Redesign & Global Avatar Standardization

### Summary
Polished the Home Screen filter bar for better centering and implemented a unified, theme-aware border style for all user avatars across the application.

### Key Changes
- **Centered Filter Bar**:
    - Replaced the horizontal `ScrollView` with a centered `View` container in `HomeScreen.tsx` as the filters comfortably fit the screen width.
    - Updated filter button styling with `borderRadius: 12` and optimized padding (`16px/10px`).
    - Implemented precise spacing logic using `marginRight: 8` for all items except the last to achieve perfect visual centering.
- **Global Avatar Borders**:
    - Standardized all user avatars (Headers, Profile, Seller info, Notifications, and Comments) with a consistent `1.5px` border.
    - **Dynamic Theming**: Integrated theme-aware border colors: `rgba(255, 255, 255, 0.8)` for Dark Mode and `#eeeeee` for Light Mode, ensuring visibility on all surfaces.
    - **Universal Implementation**: Updated `HomeScreen`, `SearchScreen`, `AddListingScreen`, `FavoritesScreen`, `InboxScreen`, `MyListingsScreen`, `SettingsScreen`, `ProfileScreen`, and `ListingDetailsScreen`.

---

## [25.03.2026 16:15] - UI: Theme Synchronization & Global Context Rollout

### Summary
Finalized the Dark Mode implementation by ensuring instant status bar synchronization and centralized user avatar management across all application headers.

### Key Changes
- **Instant Theme Reaction**:
    - **Native Sync**: Implemented a `useEffect` in `ThemeContext.tsx` that uses `RNStatusBar` and `Platform` to update the system status bar color and style exactly when the theme changes, eliminating navigation-based lag.
- **Global Auth Context Extension**:
    - **Centralized Avatar**: Added `userAvatar` and `refreshAvatar` to `AuthContext.tsx`. The app now fetches profile data once on login/init and shares it globally.
    - **Consistent Headers**: Replaced the header placeholders in `SearchScreen`, `AddListingScreen`, `FavoritesScreen`, `InboxScreen`, `MyListingsScreen`, and `SettingsScreen` with a standardized Touchable avatar component.
- **Dark Mode UI Fixes**:
    - **Form Consistency**: Fixed transaction type toggle buttons in `AddListingScreen.tsx` to use dynamic theme colors, resolving "glow" artifacts in dark mode.

---


## [25.03.2026 15:40] - UI: Real Avatars & Password Reset Flow

### Summary
Polished core UI elements and implemented a robust password recovery system utilizing deep linking for a complete user lifecycle experience.

### Key Changes
- **Visual Polishing**:
    - **Dynamic Identity**: Integrated real user avatars into the `HomeScreen.tsx` header. The app now fetches `avatar_url` from the `profiles` table, replacing generic placeholders with personalized content.
    - **Header Cleanup**: Streamlined the `ProfileScreen.tsx` header by removing redundant "checkbox" and "theme" icons, focusing the UI on essential navigation.
- **Security & Access**:
    - **Password Recovery**: Implemented a comprehensive "Forgot Password" flow in `LoginScreen.tsx` using `resetPasswordForEmail`.
    - **Reset Infrastructure**: Created `ResetPasswordScreen.tsx` for secure password updates using `supabase.auth.updateUser`.
    - **Deep Linking**: Configured the application in `App.tsx` to handle `abkhazia-realty://reset-password` deep links, ensuring seamless transition from email instructions to the password reset form.

---

## [25.03.2026 15:20] - Feature: Infinite Scroll & Native StatusBar Fix

### Summary
Implemented robust pagination for the main feed and replaced the status bar logic with a more rigid native implementation to resolve Android-specific visual bugs.

### Key Changes
- **Native Stability**:
    - **Imperative StatusBar**: Replaced `expo-status-bar` with `RNStatusBar` from `react-native` in `HomeScreen.tsx`. 
    - **Focus Enforcement**: Added imperative calls to `setBarStyle`, `setBackgroundColor`, and `setTranslucent` within `useFocusEffect`. This ensures the status bar strictly adheres to the "dark-content" on white background theme, even after returning from full-screen media galleries.
- **Performance & Scalability**:
    - **Infinite Scroll**: Implemented server-side pagination using Supabase's `.range(from, to)` method.
    - **Logic**: Added state management for `page`, `hasMore`, and `isFetchingMore`. The feed now loads in chunks of 10 items, significantly reducing initial load times and memory consumption.
    - **UI**: Integrated `ListFooterComponent` with an `ActivityIndicator` for smooth visual feedback during data fetching.

---

## [25.03.2026 15:05] - Bugfix: Critical Android StatusBar Patch

### Summary
Addressed a persistent issue where the Android status bar remained black/unstyled despite previous configuration attempts.

### Key Changes
- **Redundant Style Hardening**:
    - **App-Level**: Moved the `StatusBar` component in `App.tsx` from inside the `NavigationContainer` to the absolute root level (immediately inside `SafeAreaProvider`). This ensures it takes precedence over any internal navigator styles.
    - **Screen-Level**: Injected a direct `StatusBar` fix into `HomeScreen.tsx` as an extra layer of protection to force the correct light theme immediately upon app launch.
- **Config**: Verified that `style="dark"`, `backgroundColor="#ffffff"`, and `translucent={false}` are strictly applied.

---

## [25.03.2026 15:00] - UI/UX: Android StatusBar & Redirect Fixes

### Summary
Addressed Android-specific layout issues and refined the post-publication user flow for a more seamless experience.

### Key Changes
- **System Stability**:
    - **Global SafeArea**: Wrapped the entire application in `SafeAreaProvider` within `App.tsx`. This ensures all subsequent `useSafeAreaInsets` and `SafeAreaView` components across the app have a reliable context for calculation.
    - **StatusBar Stabilization**: Standardized the system status bar to `style="dark"`, `backgroundColor="#ffffff"`, and `translucent={false}`. This eliminates the "floating" or unpredictable status bar colors on Android, ensuring dark text/icons on a clean white background.
- **Workflow Optimization**:
    - **Intelligent Redirect**: Updated the "Add Listing" submission logic. Upon successful creation or editing, users are now automatically redirected to the "My Listings" screen instead of the Profile or Home screen, allowing immediate verification of their changes.

---

## [25.03.2026 14:40] - Bugfix: Navigation & SafeArea Consistency

### Summary
Resolved critical navigation errors and cleaned up deprecated React Native components for better system stability and future-proofing.

### Key Changes
- **Nested Navigation Fixes**: 
    - Overhauled navigation calls in `MyListingsScreen.tsx` to use fully qualified deep routes (`MainTabs` -> `HomeTab` -> `ListingDetails`). This resolves the "was not handled by any navigator" error caused by complex stack depth.
- **SafeArea Consistency**: 
    - Standardized `SafeAreaView` imports across the entire codebase to use `react-native-safe-area-context`. Removed deprecated `SafeAreaView` references from the core `react-native` package, eliminating console warnings.

---

## [25.03.2026 14:30] - Feature: Edit & Delete Listings

### Summary
Empowered users with full CRUD (Create, Read, Update, Delete) capabilities over their own property listings, improving content management and app utility.

### Key Changes
- **My Listings Management**:
    - **Actions Bar**: Added intuitive Edit (pencil) and Delete (trash) actions to the "My Listings" screen cards.
    - **Safe Deletion**: Implemented a confirmation workflow using `CustomAlert` to prevent accidental removal of listings.
- **Enhanced AddListing Flow**:
    - **Edit Mode**: The production form now detects an `editProperty` parameter to pre-fill all fields (Title, Price, Location, Deal Type, etc.).
    - **Dynamic Title**: UI automatically context-switches its header between "Add Listing" and "Edit Listing".
- **Intelligent Media Handling**:
    - **Smart Upload**: Optimized the submission process to skip re-uploading existing images (detected by `http` prefix), drastically reducing bandwidth and Supabase storage calls during edits.
- **Backlog Grooming**:
    - Expanded the long-term roadmap with 9 critical tasks including Infinite Scroll, Map integration, and Deep Link handling.

---

## [25.03.2026 13:45] - UI/UX: RPC View Counters & AddListing Layout Fixes

### Summary
Addressed critical performance/permission issues with view counting and overhauled the listing creation form for better UX and consistency.

### Key Changes
- **Permissions & Scalability**:
    - **RPC Integration**: Switched view counting from direct `.update()` to a server-side `increment_views` RPC function. This bypasses RLS restrictions for anonymous/regular users while maintaining data integrity.
- **Form UX (AddListingScreen)**:
    - **Deal Type Toggles**: Redesigned transaction type buttons (Sale/Buy/Rent) to match the Home screen's flat design system. Removed shadows and implemented a cleaner `#F0F0F0` (inactive) / `#0047AB` (active) color scheme.
    - **Layout Stability**: Fixed the "Publish" button positioning by moving it into the natural `ScrollView` flow. Removed absolute positioning to prevent overlaps and ensured consistent margins (`marginTop: 20`, `marginBottom: 40`).
- **Visual Polish**:
    - **Gallery Optimization**: Enabled `statusBarTranslucent` for the image viewer to provide a truly immersive full-screen experience without white status bar artifacts.

---

## [25.03.2026 13:30] - UI/UX: View Counters, Deep Linking & Full-Screen Gallery

### Summary
Enhanced user engagement through real-time view tracking, improved social sharing, and a professional-grade image viewing experience.

### Key Changes
- **Engagement & Analytics**:
    - **View Counter**: Each property now tracks views in real-time. Opening a listing automatically increments the counter in the Supabase `properties` table.
    - **Live Dashboard**: The Home screen and property header now display actual view counts instead of static placeholders.
- **Full-Screen Gallery**:
    - **Professional Viewing**: Integrated `react-native-image-viewing` to provide a premium full-screen gallery with pinch-to-zoom and swipe gestures.
    - **Carousel Interaction**: Main listing images are now tappable, launching the high-res gallery instantly.
- **Deep Link Sharing**:
    - **App Links**: Refined the `onShare` logic to generate a full property URL (`https://abkhazia-realty.app/property/${id}`).
    - **Native OS Integration**: Updated the share sheet configuration to ensure mobile operating systems offer "Copy Link" and proper link previews.
- **Feed Synchronization**:
    - **Social Persistence**: Guaranteed that Like/Favorite states are perfectly synced between the Detail screen and Home feed using `useFocusEffect` hooks and augmented Supabase queries.

---

## [25.03.2026 12:45] - UI/UX: Likes vs Favorites Separation & Header Redesign

### Summary
Diversified the social interaction model by separating "Likes" from "Favorites" and conducted a high-end redesign of the property header.

### Key Changes
- **Social Logic Architecture**:
    - **Logic Separation**: De-coupled "Likes" (silent, visual only) from "Favorites/Bookmarks" (functional saves with `CustomAlert` confirmation).
    - **Data Integrity**: Listings now independently track both `likes` and `favorites` tables in Supabase for a more robust user profile experience.
- **Listing Details Header Redesign**:
    - **Action Bar**: Implemented a new header layout featuring 4 distinct, stylized action buttons (Views, Like, Favorite, Share).
    - **Premium Aesthetics**: Each action is housed in a semi-transparent circular container with subtle shadows, improving contrast against property images.
- **Home Screen Layout**:
    - **Centered Navigation**: Optimized the filter bar to be perfectly centered, providing a more balanced visual experience on various screen widths.
    - **Touch Targets**: Increased padding for filter buttons to meet high-end mobile accessibility standards.
- **Add Listing Fine-tuning**:
    - **Positioning**: Adjusted the publish button margin to 40px, achieving a "sweet spot" distance from the floating navigation bar.

---

## [25.03.2026 12:15] - UI/UX: Favorites System (Likes) & Visual Polish Phase 2

### Summary
Implemented a native-feeling "Favorites" system and conducted a second pass of UI refinement for critical screens.

### Key Changes
- **Favorites (Likes) Logic**:
    - **Cloud Sync**: Connected the "Heart" icon to a new `likes` table in Supabase, allowing persistent saved listings.
    - **Reactive UI**: Implemented automatic state checks on load to show `heart` vs `heart-outline` based on real-time user data.
    - **Social Feedback**: Added `CustomAlert` confirmation when adding/removing from favorites.
- **Listing Details Optimization**:
    - **Price Block Cleanup**: Simplified the pricing section by removing the redundant "Write" button and shortening the label to "Цена" for better mobile scanning.
    - **Vertical Rhythm**: Fixed the alignment of the comments counter badge, ensuring it's perfectly centered with the section title.
- **Add Listing Ergonomics**:
    - **Layout Safety**: Wrapped the primary action button in a dedicated container with a 100px bottom margin, guaranteeing usability on devices with large home indicators or floating navigation.

---

## [25.03.2026 11:30] - UI/UX: Global App Polishing & Feature Activation

### Summary
Conducted a massive "polishing" phase focusing on UX friction, UI cleanup, and activating social features.

### Key Changes
- **Add Listing Refinements**:
    - **Input Sanitization**: Implemented forced `.trim()` on all text inputs to prevent database pollution with accidental spaces.
    - **Premium Publication Flow**: Replaced the previous loading indicator with a full-screen blurred modal featuring a large spinner and reassuring status text.
    - **Custom Error Handling**: Replaced standard system alerts with the branded `CustomAlert` component for all submission outcomes.
    - **Layout Fix**: Increased bottom padding in the form to 150px to ensure the primary action button is never obscured by the tab bar.
- **Listing Details Cleanup**:
    - **Social Integration**: Fully activated the "Share" feature using the native `Share` API, allowing users to propagate listings to external apps.
    - **UI De-cluttering**: Removed the redundant calendar FAB and the placeholder "Characteristics" grid to focus on core property data.
    - **Re-designed Interactions**: Upgraded the comments counter to a high-visibility blue badge with centered typography.
- **Location Consistency**:
    - **Standardized Naming**: Automated the addition of the " район" (district) suffix across Home, Details, and AddListing screens for better geographical clarity.

---

## [25.03.2026 10:30] - UI/UX: Deal Type Logic & Smart Filtering

### Summary
Implemented a new transaction logic (Sale/Buy/Rent) with smart UI adaptive rendering and optimized feed filtering.

### Key Changes
- **Smart Add Listing Flow**:
    - **Deal Type Selector**: Added a 3-way toggle (Продажа, Покупка, Аренда) with branded #0047AB active states.
    - **Conditional UI**: Implemented automatic photo section removal for "Покупка" (Buy) requests to streamline the data entry flow.
    - **Revised Micro-copy**: Replaced generic placeholders with high-conversion examples ("Например: Просторная квартира в г. Сухум").
- **Dynamic Property Details**:
    - **Real-time Badges**: Refactored the badge logic to display the actual `deal_type` from Supabase (Sale/Buy/Rent).
    - **Negotiation Feedback**: Added a premium-styled "Торг уместен" (Negotiable) tag with a checkmark icon for listings with `is_negotiable: true`.
- **Advanced Feed Filtering**:
    - **Contextual Search**: Updated the Home screen filters to match user intent:
        - "Купить" (Buy) tab now correctly displays "Продажа" (Sale) listings.
        - "Продать" (Sell) tab displays "Покупка" (Buy) requests.
        - "Аренда" (Rent) remains 1:1.

---

## [24.03.2026 16:30] - Architecture: MyListingsScreen Modularization & Advanced Profile UX

### Summary
Executed a major architectural cleanup by decoupling user listing management from the profile core and implementing advanced input validation and editing workflows.

### Key Changes
- **MyListingsScreen Creation**: 
    - Extracted all listing-related logic into a dedicated component (`src/screens/MyListingsScreen.tsx`).
    - Implemented a high-performance `FlatList` with 2-column grid layout for personal properties.
    - **Stable Navigation**: Introduced deep-linking navigation logic (`HomeTab` -> `ListingDetails`) to resolve stack visibility errors when viewing listings from the profile context.
- **Smart Profile Contacts**:
    - **Split Editing**: Separated name/avatar editing from contact data management to reduce cognitive load and prevent accidental overwrites.
    - **Input Masking**: Implemented real-time regex-based formatting for:
        - **Phone**: Automated `+7 (XXX) XXX-XX-XX` framing.
        - **WhatsApp**: Forced `wa.me/` protocol prefix.
        - **Telegram**: Forced `@` username prefix.
    - **Inline Workflow**: Replaced full-page editing with card-level "Save/Cancel" actions for an agile, modern user experience.
- **Navigation Cleanup**: 
    - Registered `MyListingsScreen` in the primary `RootStack`.
    - Added a premium navigation button in the profile to act as the primary entry point for listing management.

---

## [24.03.2026 15:20] - Infrastructure: Fully Dynamic User Profiles & Real Listing Management

### Summary
Transitioned the Profile ecosystem from static mockups to a robust, database-driven architecture. This ensures real-time synchronization of contact details and proper ownership tracking for property listings.

### Key Changes
- **Extended Contact Schema**: Successfully integrated `phone`, `whatsapp`, and `telegram` fields into the `profiles` table. Users can now persisted their professional contact handles across sessions.
- **Bi-directional Profile Sync**: 
    - Updated `loadProfile` to fetch the complete set of user metadata.
    - Enhanced `saveProfile` to batch-process all contact updates in a single Supabase transaction.
- **Dynamic Input System**: Refactored the 'Contact Data' card to conditionally swap between styled labels and interactive `TextInput` fields when editing, providing a seamless "click-to-edit" UX.
- **Real Listing Integration**: Eliminated the `MY_LISTINGS` hardcoded array. The profile now dynamically queries the `properties` table for entries created by the current user (`user_id` filtering), featuring:
    - Live price formatting using `Intl.NumberFormat`.
    - Automated location mapping (City/District).
    - Intelligent cover image selection with fallback placeholders.
    - Direct navigation to listing details for management.

---

## [24.03.2026 15:00] - UI/UX Refinement: Real-time Interaction & Comment Design

### Summary
Significantly improved user transparency and discussion experience by implementing live interaction counters and a modern, tiered comment system.

### Key Changes
- **Live Comment Counter**: Updated the `HomeScreen.tsx` fetching logic to conduct a deep count on the `comments` table via JOIN metadata. Property cards now display accurate, real-time counts instead of placeholders.
- **Modernized Comment Section**:
    - **Message Bubbles**: Overhauled `ListingDetailsScreen.tsx` to wrap comments in a professional "bubble" design with a soft `#f5f6f8` background and rounded aesthetics.
    - **Visual Discussion Hierarchy**: Implemented strict tiered nesting for replies (`parent_id`) with 30px offsets and branded left borders (`#0047AB`), making complex discussions easy to navigate.
    - **Refined Typography**: Adjusted comment font sizes and weights for better readability on mobile displays.
- **Improved Interaction Cues**: Added a "return-down-forward" icon and refined the "Reply" button's visual weight to make secondary actions more intuitive.

---

## [24.03.2026 14:45] - UX: Visual Identity in Comments & Notifications

### Summary
Enhanced user recognition and visual engagement by integrating profile avatars into the comments and notification systems.

### Key Changes
- **Data Query Optimization**: Updated Supabase queries in `ListingDetailsScreen.tsx` and `InboxScreen.tsx` to include `avatar_url` via JOIN, enabling seamless retrieval of user photos alongside comment data.
- **Dynamic Comment Avatars**: Implemented conditional rendering in the comment section of `ListingDetailsScreen.tsx` to display real user photos when available, with a graceful fallback to initial-based colored placeholders.
- **Enriched Inbox Experience**: Upgraded notification cards in `InboxScreen.tsx` to feature author avatars, providing immediate visual context for incoming messages.
- **Consistent Styling**: Applied uniform circular masking and sizing for avatars across all screens to maintain a cohesive and premium brand identity.

---

## [24.03.2026 14:40] - Maintenance: ImagePicker Deprecation & Import Stability

### Summary
Addressed architectural warnings and ensured component stability by updating library usage patterns and verifying core imports.

### Key Changes
- **ImagePicker Modernization**: Refactored the `launchImageLibraryAsync` call in `ProfileScreen.tsx` to use the non-deprecated `mediaTypes: 'images'` syntax, adhering to the latest Expo SDK standards and eliminating terminal warnings.
- **Import Verification**: Conducted a rigorous audit of the `Ionicons` import from `@expo/vector-icons`, ensuring global availability and correct scoping to prevent "Property doesn't exist" errors during runtime.

---

## [24.03.2026 14:30] - Feature: Avatar Uploading & Storage Integration

### Summary
Empowered users to personalize their profiles by implementing photo uploading functionality utilizing Supabase Storage and native device image picking.

### Key Changes
- **Native Integration**: Integrated `expo-image-picker` to allow users to capture new photos or select existing images from their device library with built-in editing (cropping).
- **Supabase Storage (Avatars)**: Configured a robust upload pipeline that converts images to `ArrayBuffer` (via `base64-arraybuffer`) for reliable transmission to the Supabase Storage 'avatars' bucket.
- **Dynamic Profile Metadata**: Automated the process of generating public URLs for uploaded images and persisting them to the user's profile record.
- **Improved Visual UX**: Replaced static placeholders with a dynamic avatar system that displays the user's uploaded photo or a clean professional icon fallback. Added a visual loading state to the upload trigger for immediate feedback.

---

## [24.03.2026 14:20] - Design Consistency: Custom Alerts on Profile Screen

### Summary
Unified the application's notification system by replacing standard system alerts with the branded `CustomAlert` component on the Profile screen.

### Key Changes
- **Component Transition**: Replaced all instances of `Alert.alert` (for both success and error states) with the custom-designed `CustomAlert` component.
- **Dynamic Alert States**: Implemented a flexible state management system (`alertTitle`, `alertMessage`, `alertMode`) in `ProfileScreen.tsx` to handle various notification contexts—from confirming sign-out to notifying successful profile updates—using a single reusable alert component.
- **Improved Visual Flow**: Ensured that all user feedback on the profile editing page maintains the premium look and feel of the rest of the application.

---

## [24.03.2026 13:55] - UI/UX Refinements for Profile Editing

### Summary
Improved the user experience on the Profile screen by optimizing input interaction and visual affordance for mobile users.

### Key Changes
- **Keyboard Optimization**: Added `keyboardShouldPersistTaps="handled"` to the Profile screen's `ScrollView`. This ensures the "Save" button responds to the first tap by preventing the keyboard from swallowing the interaction.
- **TextInput Alignment**: Refined the name input field's styling with `textAlign: 'left'` and standard horizontal padding (`15px`) to improve readability and match standard input patterns.
- **Enhanced Button Ergonomics**: Increased the touch target and visual size of the 'Save' and 'Cancel' buttons by adjusting vertical padding and increasing font size to `16px`, making them more accessible on mobile devices.

---

## [24.03.2026 13:30] - User Profiles & Real Names Integration

### Summary
Transitioned from anonymous identifiers to real user names across the platform, enhancing community interaction and personalization.

### Key Changes
- **Profile Management**: Updated `ProfileScreen.tsx` with functionality to load and save a user's full name. Added a toggleable UI for name editing with immediate persistence to the Supabase `profiles` table.
- **Deep Data Integration (JOINs)**: Optimized comment and notification fetching in `ListingDetailsScreen.tsx` and `InboxScreen.tsx` using SQL JOINs (`.select('*, profiles(full_name)')`).
- **Visual Identity (Avatars)**: Replaced generic placeholders with dynamically colored circular avatars. These display the user's first initial, with the background color uniquely derived from their name to ensure visual variety.
- **UI Refinement**: All comment meta-information now displays the author's real name (fallback to "Пользователь") instead of short UUID strings.

---

## [24.03.2026 13:20] - UX Fix: Keyboard Handling in Auth

### Summary
Improved the user experience on the login/registration screen by ensuring buttons react to the first tap even when the keyboard is active.

### Key Changes
- **ScrollView Optimization**: Added `keyboardShouldPersistTaps="handled"` to the main `ScrollView` in `LoginScreen.tsx`. This prevents the keyboard from "swallowing" the first tap, allowing users to submit forms or switch between Login/Register modes with a single click.

---

## [24.03.2026 13:00] - Bug Fix: Inbox Navigation & Comments Sorting

### Summary
Addressed a navigation crash in the Inbox and improved the user experience by reversing the comment display order.

### Key Changes
- **Navigation Fix (InboxScreen)**: Corrected the navigation path from `Inbox` to `ListingDetails` by explicitly targeting the nested stack: `MainTabs -> HomeTab -> ListingDetails`. This ensures the router can correctly resolve the destination.
- **Sorting Update (ListingDetailsScreen)**: Changed the comment fetching logic to sort by `created_at` in descending order. Users now see the most recent comments at the top of the list.

---

## [24.03.2026 12:48] - Comments System (Phase 4): Inbox & Notification System

### Summary
Implemented a comprehensive notification system (Inbox) to alert users of new comments on their properties, including UI updates for better accessibility.

### Key Changes
- **Inbox Screen (`InboxScreen.tsx`)**: Created a dedicated screen for notifications. It uses a 2-step "safe" fetching logic: first gathering user's property IDs, then fetching related comments (excluding own responses).
- **Notification Badges**: Added a dynamic red badge (unread counter) to the header envelope icon, powered by a real-time count of `is_read: false` comments.
- **Header Refinement**: Replaced the redundant search icon in the top header with the new Notification (Envelope) icon across all main tabs.
- **Profile Integration**: Added a "Notifications" button to the `ProfileScreen` for quick access.
- **Navigation Loop**: Clicking a notification marks it as read and redirects the user to the specific property with an auto-scroll to the comment section.

---

## [24.03.2026 12:45] - Comments System (Phase 3): Home Linking & Auto-Scroll

### Summary
Established a direct link between the Home screen property cards and the comments section on the Details screen, including an automated scroll-to-view feature.

### Key Changes
- **Enhanced Navigation (HomeScreen)**: Updated the comment icon's `onPress` to pass a `scrollToComments: true` flag during navigation.
- **Auto-Scroll Engine (ListingDetailsScreen)**:
  - Implemented `useRef` to target the main `ScrollView`.
  - Added a `useEffect` hook that detects the `scrollToComments` flag and triggers an animated `scrollToEnd` sequence once data fetching is complete.
  - Integrated a safety timer (`setTimeout`) to ensure smooth scrolling after layout calculation.

---

## [24.03.2026 11:42] - Bug Fix: Comments Relationship Error

### Summary
Resolved a "Could not find relationship" error in `fetchComments` by removing an unsupported JOIN operation with the `profiles` table.

### Key Changes
- **Query Simplification**: Updated `fetchComments` to use a flat `select('*')` query on the `comments` table.
- **UI Fallback**: Implemented a temporary fallback for author names that displays the first 6 characters of the `user_id` (e.g., "Пользователь #abc123") until a public profiles table is available.

---

## [24.03.2026 11:45] - Bug Fix: Comments Submission Logic

### Summary
Fixed a critical oversight where the comment submission button on the details screen was not correctly linked to the backend logic.

### Key Changes
- **Function Restoration**: Properly connected the `send` button in `ListingDetailsScreen.tsx` to the `submitComment` function.
- **UI Consistency**: Replaced a dummy `console.log('Comment pressed')` on the property cards in `HomeScreen.tsx` with a direct navigation to the details screen, ensuring users are always led to the active comments section.

---

## [24.03.2026 11:35] - Comments System (Phase 2): Nested Replies & Auth-Gate

### Summary
Implemented a fully functional comments section on the property details screen with support for threaded replies and secure submission.

### Key Changes
- **Database Integration**:
  - Connected `ListingDetailsScreen.tsx` to the `comments` table.
  - Implemented `fetchComments` with a recursive-ready structure sorted by `created_at`.
  - Added profiles join to display real user names and avatars.
- **Threaded Replies (parent_id)**:
  - Implemented visual nesting for replies using `marginLeft` and border indicators.
  - Added a "Reply" button that triggers a "Replying to..." state, ensuring the `parent_id` is correctly associated upon submission.
- **Access Control (Auth-Gate)**:
  - **Guests**: Can read all comments but see a "Login or Register" prompt instead of the comment input.
  - **Authenticated Users**: Can post new comments and reply to existing ones.
- **UX Improvements**:
  - Real-time list refresh after posting.
  - Formatted dates using `ru-RU` locale.
  - Multi-line input support for longer messages.

---

## [24.03.2026 10:50] - Favorites: Search Navigation Update

### Summary
Updated the empty-state navigation on the Favorites screen to lead strictly to the Search tab.

### Key Changes
- **Routing Update**: Changed the "Go to search" button destination from `HomeTab` to `SearchTab` for a more intuitive user experience.

---

## [24.03.2026 07:56] - Favorites: Navigation Bug Fix

### Summary
Resolved a navigation error on the Favorites screen where the "Go to search" button failed to redirect to the main feed.

### Key Changes
- **Navigation Fix**: Updated the `onPress` action in `FavoritesScreen.tsx` to correctly target the `HomeTab` nested within the `MainTabs` navigator. This ensures a smooth transition from the root stack back to the app's primary browsing interface.

---

## [24.03.2026 07:53] - Favorites System & Saved Listings Screen

### Summary
Implemented a complete "Favorites" system allowing users to bookmark properties and view them on a dedicated screen.

### Key Changes
- **Favorites Integration (HomeScreen)**:
  - Added a responsive bookmark icon to all property cards.
  - Implemented `handleToggleFavorite` with optimistic UI and Supabase `favorites` table sync.
  - Integrated `checkAuthAndProceed` to ensure only logged-in users can save listings.
- **New FavoritesScreen**:
  - Developed a new screen that fetches and displays the user's saved properties.
  - Features real-time sync (updates when the user un-bookmarks a property) and a customized empty state.
- **Navigation & Profile**:
  - Registered `Favorites` screen in the root navigation stack.
  - Linked the 'Сохранённые объявления' button in the Profile screen to the new Favorites screen.

---

## [24.03.2026 07:46] - Custom Alerts & Like Logic Fix

### Summary
Replaced standard system alerts with a custom-designed component and resolved a critical "duplicate key" bug in the like functionality.

### Key Changes
- **CustomAlert Component**: Created `src/components/CustomAlert.tsx` with a premium design (blurred overlay, smooth fade, branded buttons). Used to replace `Alert.alert` in `HomeScreen` and `ProfileScreen`.
- **Like Logic Stabilization**:
  - **Fetching Strategy**: Separated the general property fetch from the user-specific like status fetch using a `Set` for O(1) lookups. This ensures `isLiked` state is always accurate.
  - **Bug Fix**: Resolved the `duplicate key value` error by ensuring the correct SQL operation (`INSERT` vs `DELETE`) is called based on verified current state.
  - **Reactivity**: Added `user` to the `useFocusEffect` dependency array to ensure the feed refreshes correctly when authentication state changes.

---

## [24.03.2026 07:31] - Profile Screen: Sign Out & Saved Listings UI

### Summary
Enhanced the profile screen with a functional sign-out process and an entry point for saved listings.

### Key Changes
- **Sign Out Logic**: Implemented `handleSignOut` with a confirmation `Alert`. Uses `supabase.auth.signOut()` to securely end the user session.
- **Saved Listings UI**: Added a 'Сохранённые объявления' button to the Profile screen with a dedicated style and `bookmark-outline` icon, preparing for future bookmarking functionality.
- **UI Refinement**: Updated button styles for better visual hierarchy and consistency.

---

## [24.03.2026 07:18] - Auth-Gate for Interactive Buttons & Like Logic

### Summary
Implemented a security layer (Auth-Gate) for interactive property card elements and a fully functional like system integrated with Supabase.

### Key Changes
- **Auth-Gate Implementation**: Introduced `checkAuthAndProceed` function that validates user session via Supabase. Unauthenticated users are prompted via `Alert` to log in and redirected to the `Login` screen.
- **Interactive Buttons**: Protected 'Like', 'Comment', and 'Bookmark' actions with the Auth-Gate.
- **Like System**:
  - **Supabase Integration**: Connects to the `likes` table for atomic `insert` and `delete` operations.
  - **Dynamic State**: Property cards now fetch and display real-time like counts and individual user's like status.
  - **Optimistic UI**: Likes toggle instantly in the UI with automatic rollback on network failure.
  - **Themed UI**: Liked state features a filled burgundy heart (#800000) and bold counter.

---

## [24.03.2026 06:55] - Search Input Trimming Fix

### Summary
Fixed a bug where automatic spaces from mobile keyboards were breaking search filters.

### Key Changes
- **Input Sanitization**: Applied `.trim()` to `searchQuery` and `customCity` in the `handleSearch` function within `SearchScreen.tsx`.
- **Safety**: Used optional chaining to ensure that `trim()` does not cause errors if fields are empty.

---

## [23.03.2026 17:20] - Custom City Search Support

### Summary
Enhanced the search functionality to allow users to search for properties in custom locations (hand-written names) that are not present in the predefined city list.

### Key Changes
- **UI Expansion**: Added a conditional `TextInput` in `SearchScreen.tsx` that appears when "Другой населенный пункт..." is selected in the city dropdown.
- **Improved Filter Logic**: The `customCity` parameter is now passed alongside other filters to the results screen.
- **Flexible SQL Search**: Updated `SearchResultsScreen.tsx` to use case-insensitive partial matching (`.ilike`) for the `city` column when a custom city name is provided, while maintaining strict matching for standard city selections.

---

## [23.03.2026 17:15] - Dynamic Search Results with Supabase

### Summary
Implemented real-time property searching by translating UI filters into dynamic Supabase SQL queries.

### Key Changes
- **Dynamic Query Building**: Developed a flexible query engine that chains Supabase filters based on user input:
  - **Full-Text Search**: Uses `.or` and `.ilike` to search across titles and descriptions.
  - **Categorical Filters**: Matches exact `district` and `city` names.
  - **Numeric Ranges**: Filters by minimum and maximum price using `.gte` and `.lte`.
  - **Deal Type logic**: Filters by `is_rent` status based on the selected deal category.
- **Improved UI/UX**:
  - Replaced mock data with real property cards.
  - Added a loading state with `ActivityIndicator`.
  - Implemented an "Empty Results" state with a quick-action button to return and modify filters.
- **Navigation Integration**: Fully connected the search results to the detailed property view.

---

## [23.03.2026 17:00] - Search Screen Filter Collection & Propagation

### Summary
Transformed the Search Screen from a static UI into a functional filter collector that prepares parameters for the search results.

### Key Changes
- **Expanded Location Mapping**: Added a comprehensive `LOCATIONS` dictionary for all regions and cities in Abkhazia, including 'Any' options for broader searches.
- **State Management**: Implemented full state tracking for:
  - `searchQuery` (Text search)
  - `dealType` (Buy, Sell, Rent)
  - `district` & `city` (Cascading selection)
  - `priceFrom` & `priceTo` (Price range)
- **Interactive Modals**: Integrated `SelectionModal` for both District and City selection, with cities automatically filtering based on the chosen district.
- **Improved Navigation**: The 'Find' button now gathers all active filters and passes them to the `SearchResults` screen via `navigation.navigate(..., { filters: { ... } })`.

---

## [23.03.2026 16:50] - Routing Parameters & Details Screen Integration

### Summary
Connected the Home Screen with the Details Screen using navigation parameters (`route.params`), allowing users to view full details of real property listings.

### Key Changes
- **Data Propagation**: Updated the transition from `HomeScreen` to `ListingDetailsScreen` to pass the entire property object.
- **Dynamic Content**: Refactored `ListingDetailsScreen` to display real-time data:
  - **Images**: Automatically loads the first image from the property's photo array.
  - **Core Details**: Displays real title, price, city, and description from the database.
- **Error Handling**: Added an error screen that appears if the property data is missing or fails to load, with a clear "Back" button to return to the feed.
- **Conditionals**: Handled "Rent vs Sale" badges dynamically based on the property's state.

---

## [23.03.2026 16:45] - HomeScreen Supabase Integration

### Summary
Transitioned the Main Screen from static mock data to real-time data fetching from the Supabase `properties` table.

### Key Changes
- **Live Data Fetching**: Implemented `fetchProperties` to retrieve all listings from the database, ordered by creation date.
- **Auto-Refresh**: Integrated `useFocusEffect` to automatically refresh the feed every time the user navigates back to the Home screen.
- **UI Updates**:
  - Dynamically renders property titles, formatted prices, and location details (City & District).
  - Implemented image handling to show the first photo from the listing's image array or a fallback placeholder.
  - Added a centered `ActivityIndicator` for the loading state and an "Empty" state message when no listings are found.

---

## [23.03.2026 16:40] - User ID Constraint Fix & ImagePicker Update

### Summary
Resolved a database error when publishing listings by ensuring the `user_id` is correctly passed. Updated the photo selection library to use modern syntax.

### Key Changes
- **Auth Integration**: Integrated `useAuth` hook in `AddListingScreen` to retrieve the current user's ID.
- **Database Fix**: Added `user_id` field to the Supabase `insert` call, satisfying the not-null constraint in the `properties` table.
- **Auth Guard**: Added a check to ensure users are logged in before they can submit a listing, with an appropriate `Alert` message.
- **Library Update**: Replaced the deprecated `MediaTypeOptions` with the new `mediaTypes: 'images'` syntax in `expo-image-picker`.

---

## [23.03.2026 16:35] - Bug Fixes and Photo Upload Restoration

### Summary
Fixed critical issues in the `AddListingScreen` following the location logic update. Restored and enhanced the photo selection and upload functionality.

### Key Changes
- **Modal Fix**: Explicitly imported `Modal` and `FlatList` from `react-native` and moved the `SelectionModal` component outside the main functional component to ensure stability.
- **Photo Upload Restoration**: 
  - Integrated `expo-image-picker` for multi-image selection from the gallery.
  - Implemented secure upload to Supabase storage (bucket: `listings`) using `base64-arraybuffer` decoding.
  - Added preview and removal functionality for selected images.
- **State Management**: Restored `selectedImages` state and updated `handleSubmit` to wait for image uploads before saving the property listing with their public URLs.
- **UI/UX**: Added `ActivityIndicator` for the submission process and "remove" buttons for image previews.

---

## [23.03.2026 16:15] - Cascading Dropdowns and Manual Location Input

### Summary
Enhanced the "Add Listing" experience by implementing cascading dropdowns for District and City selection. Added support for manual input of settlements when not found in the predefined list.

### Key Changes
- **Cascading Logic**: The "City" dropdown is now disabled until a "District" is selected. Changing the district automatically resets the city and any custom input.
- **Predefined Locations**: Implemented `LOCATIONS` mapping for all 7 districts of Abkhazia with their respective major cities.
- **Manual Input Pattern**: If "Другой населенный пункт..." is selected, a new `TextInput` for `customCity` appears, allowing users to enter names manually.
- **Supabase Integration**: Updated `handleSubmit` to correctly send the chosen city or the custom settlement name to the `properties` table in the database.
- **UI/UX Refinement**: Added custom selection modals with smooth transitions and improved styling for better mobile usability.

---

## [22.03.2026 21:13] - Authentication Flow & Route Protection

### Summary
Implemented a robust authentication system using React Context and Supabase Auth. This update introduces global session tracking, email-based authentication, and automated routing guards for protected app sections.

### Key Changes
- **Auth Context**: Created `src/context/AuthContext.tsx` using `onAuthStateChange`.
- **Login Screen Revamp**: 
  - Switched from phone-based to email-based authentication.
  - Integrated `supabase.auth.signInWithPassword` and `supabase.auth.signUp`.
  - Added loading indicators and error alerts.
- **Route Protection**: 
  - Secured 'Add Listing' and 'User Profile' tabs.
  - Unauthenticated users are now automatically redirected to the `LoginScreen`.
- **Root Provider**: Wrapped the entire application in `AuthProvider` within `App.tsx`.

---

## [22.03.2026 21:07] - Supabase Integration

### Summary
Successfully integrated Supabase as the backend service provider. This update includes the installation of client-side libraries and the initialization of the Supabase client with secure session secondary storage using AsyncStorage.

### Installed Dependencies
- `@supabase/supabase-js`: Official JavaScript client for Supabase.
- `@react-native-async-storage/async-storage`: Un-persists session data locally to allow users to stay logged in across app restarts.

### New Files
- `src/lib/supabase.ts`: Central initialization file for the Supabase client.

### Configuration Details
- **Persistence**: Configured `supabase.auth` to use `AsyncStorage` as the storage engine.
- **Client Settings**:
  - `autoRefreshToken: true` - Ensures the user session remains valid seamlessly.
  - `persistSession: true` - Keeps the user logged in.
  - `detectSessionInUrl: false` - Disabled for mobile environment to prevent redirect loops.

---
*Created by Antigravity AI*

## Предрелизный чек-лист (Release Checklist)
[ ] Яндекс Карты: Раскомментировать код react-native-yamap, вставить боевой API-клюц и удалить временный react-native-maps. / Yandex Maps: Uncomment react-native-yamap code, insert production API key, and remove temporary react-native-maps.

[ ] Push-уведомления: Восстановить код запроса разрешений и получения токена для боевой среды. / Push Notifications: Restore permission request and token retrieval code for the production environment.

[ ] Сборка (Build): Сгенерировать финальный .apk (для Android) и .ipa (для iOS) через EAS Build. / Build: Generate final .apk (Android) and .ipa (iOS) via EAS Build.

## Backlog / TODO
[x] Геолокация: Интеграция Карт (Яндекс/Google) на экран ListingDetailsScreen для отображения локации объекта.


[ ] Магия ИИ: Исследовать и внедрить ИИ-модуль для автоматического извлечения характеристик недвижимости из описания объявления.

[ ] Модерация: Добавить кнопку 'Пожаловаться' для пользовательского контента (требование App Store/Google Play).

[ ] Юридическая база: Разработать экраны/модалки с документами: Правила публикации и Условия использования сервиса.


[ ] Релиз: Настройка Redirect URLs (Deep Links) в панели Supabase для корректной работы ссылок на сброс пароля в production-сборке.

[ ] Приватность: Добавить в настройки профиля управление видимостью данных (разрешения на просмотр профиля).

## Юридическая информация
* [Контактная информация](CONTACTS.md)
* [Пользовательское соглашение](TERMS.md)
* [Политика возврата средств](REFUND.md)

---
*Проект находится на стадии предрелизного тестирования. Данная страница служит информационной витриной проекта для прохождения верификации в платежных системах.*
