// 1. Загрузка прогресса из памяти
let currentLoc = localStorage.getItem('lastLocation') || "Лестница";
let isNight = localStorage.getItem('isNightState') === 'true';
let hasBooks = localStorage.getItem('hasBooksState') === 'true';
let energi = localStorage.getItem('energiState') === 'true';
let hasKey = localStorage.getItem('hasBasementKey') === 'true';
let gameGG = localStorage.getItem('gamedaedKey') === 'true';
let pName = localStorage.getItem('playerName') || "Игрок";

let teacherInBasement = false;
let currentMonologueStep = 0; 

const images = {
    "Лестница": "url('Assets/Lestnica.jpg')",
    "Коридор": "url('Assets/koridor.jpg')",
    "Фае": "url('Assets/Fae.jpg')",
    "Выход": "url('Assets/Exit.jpg')",
    "Библиотека": "url('Assets/Biblio.jpg')",
    "Класс": "url('Assets/Class.jpg')",
    "ЛестницаНЧ": "url('Assets/Lestnica_night.jpg')",
    "КоридорНЧ": "url('Assets/loridor_night.jpg')",
    "ФаеНЧ": "url('Assets/Fae_night.jpg')",
    "ВыходНЧ": "url('Assets/Exit_night.jpg')",
    "БиблиотекаНЧ": "url('Assets/Biblio_night.jpg')",
    "КлассНЧ": "url('Assets/Class_night.jpg')",
    "Подвал": "url('Assets/podval.jpg')",
    "ПодвалНЧ": "url('Assets/podval.jpg')",
    "Чердак": "url('Assets/cherdak.png')",
    "ЧердакНЧ": "url('Assets/cherdak.png')"
};

const locations = {
    "Лестница": { up: "Коридор", down: "Фае", text: "Тишина. Только эхо шагов." },
    "Коридор": { 
        left: "Класс", down: "Лестница", up: "Чердак",
        note: {
            title: "Странник Модер",
            text: `Здравтсвуй дитя, я странник что в ночи найдет путь из полнейшей тьмы,
            и укажет дорогу теням. Мой брат поглощен тьмой и раз ты читаешь это, то он
            завлек тебя в бездну. Нужно быстрее выбиратся!!! Сущность любит играть, у него
            есть ключ к выходу. Секрет брата в его обиталище - ложь !
            Удачи дитя, да и пусть свет укажет тебе путь...`
        }
    },
    "Фае": { up: "Лестница", right: "Выход", left: "Библиотека", down: "Подвал", avto: "Assets/avtomat.png" },
    "Подвал": { up: "Фае", ener: "Assets/Energi.png", char: "Assets/On.png"},
    "Выход": { left: "Фае", look: "Assets/password.png" },
    "Библиотека": { right: "Фае", char: "Assets/Ono.png" },
    "Класс": {
        predlv: "Assets/Ichic.png",
        right: "Коридор", 
        char: "Assets/On.png"
    },
    "Чердак": { down: "Коридор", char: "Assets/Smot.png" }
};

// 2. Инициализация звуков и музыки
window.addEventListener('DOMContentLoaded', () => {
    // Включаем музыку при первом клике по экрану (требование безопасности браузеров)
    document.body.addEventListener('click', () => {
        manageMusic();
    }, { once: true });

    updateScreen();
});

// Управление фоновой музыкой и громкостью
function manageMusic() {
    const dayAudio = document.getElementById('day-music');
    const nightAudio = document.getElementById('night-music');
    const moveAudio = document.getElementById('move-sound');
    
    // Подтягиваем громкость из памяти меню (по умолчанию 50%)
    const savedVolume = localStorage.getItem('gameVolume') || 50;
    const volumeRatio = savedVolume / 100;

    // Применяем громкость ко всем звукам в игре
    if (dayAudio) dayAudio.volume = volumeRatio;
    if (nightAudio) nightAudio.volume = volumeRatio;
    if (moveAudio) moveAudio.volume = volumeRatio;

    if (!dayAudio || !nightAudio) return;

    if (isNight) {
        // Ночь: включаем ночной трек, глушим дневной
        if (nightAudio.paused) nightAudio.play().catch(() => {});
        dayAudio.pause();
        dayAudio.currentTime = 0;
    } else {
        // День: включаем дневной трек, глушим ночной
        if (dayAudio.paused) dayAudio.play().catch(() => {});
        nightAudio.pause();
        nightAudio.currentTime = 0;
    }
}

// Воспроизведение звука шагов/перемещения
function playMoveSound() {
    const moveAudio = document.getElementById('move-sound');
    if (moveAudio) {
        moveAudio.currentTime = 0; // Сбрасываем в начало, чтобы звук играл мгновенно при каждом клике
        moveAudio.play().catch(e => console.log("Звук шага ожидает клика по экрану"));
    }
}

// 3. Основная функция обновления экрана
function updateScreen() {
    const loc = locations[currentLoc];
    const gameContainer = document.getElementById('game-container');

    // Проверяем актуальность музыки при каждой смене локации
    manageMusic();

    // Сбрасываем диалоги
    const dBox = document.getElementById('dialog-box');
    dBox.style.display = "none";
    dBox.style.opacity = "0";

    // Установка фона
    let currentKey = isNight ? currentLoc + "НЧ" : currentLoc;
    gameContainer.style.backgroundImage = images[currentKey] || images[currentLoc];
    document.getElementById('location-name').innerText = currentLoc + (isNight ? " (Ночь)" : "");

    // Кнопки навигации
    // 🆕 Если Учитель заблокировал подвал — скрываем кнопку Вверх (Выход из подвала)
    if (currentLoc === "Подвал" && teacherInBasement) {
        document.getElementById('btn-up').style.visibility = "hidden";
    } else {
        document.getElementById('btn-up').style.visibility = loc.up ? "visible" : "hidden";
    }
    document.getElementById('btn-down').style.visibility = loc.down ? "visible" : "hidden";
    document.getElementById('btn-left').style.visibility = loc.left ? "visible" : "hidden";
    document.getElementById('btn-right').style.visibility = loc.right ? "visible" : "hidden";

    // Записка в коридоре
    const smallNote = document.getElementById('small');
    if (loc.note && isNight) {
        smallNote.style.display = "block";
    } else {
        smallNote.style.display = "none";
    }

    // Предмет слева (Ящик в Классе)
    const predImgLv = document.getElementById('predmetLv');
    if (loc.predlv) { 
        predImgLv.src = loc.predlv;
        predImgLv.style.display = "block";
        
        predImgLv.onclick = () => {          
            if (isNight) {
                saveState();
                window.location.href = "Box.html";
            } else {
                showDialog("Учитель", `Эй, ${pName}! А ну-ка отойди от моего ящика! Займись делом и принеси учебники!`);
            }
        };
    } else {
        predImgLv.style.display = "none";
    }

    // Замок на Выход
    const LookImg = document.getElementById('Look');
    if (loc.look) {
        LookImg.src = loc.look;
        LookImg.style.display = "block";
        LookImg.onclick = () => {
            if (energi) {
                saveState();
                window.location.href = "Look.html";
            } else {
                showDialog("Система", "Нет питания. Нужно включить энергию в подвале!");
            }
        };
    } else {
        LookImg.style.display = "none";
    }

    // Автомат с игрой в Фае
    const avtoImg = document.getElementById('Avtomat');
    if (loc.avto) {
        avtoImg.src = loc.avto;
        avtoImg.style.display = "block";
              
        if (isNight) {
            avtoImg.style.filter = "brightness(1) drop-shadow(0 0 15px gold)";
            avtoImg.style.cursor = "pointer";
            avtoImg.onclick = () => {
                saveState();          
                window.location.href = "AvtomatGame.html";   
            };
        } else {
            avtoImg.style.filter = "brightness(0.4)";
            avtoImg.style.cursor = "default";
            avtoImg.onclick = () => {
                showDialog("Мысли", "Автомат не работает...");
            };
        }
    } else {
        avtoImg.style.display = "none";
    }

    // Электричество в подвале
    const enerImg = document.getElementById('Energi');
    if (loc.ener) {
        enerImg.src = loc.ener;
        enerImg.style.display = "block";
        
        if (energi) {
            enerImg.style.filter = "drop-shadow(0 0 15px #2ecc71)";
        } else {
            enerImg.style.filter = "grayscale(1) brightness(0.7)";
        }

        enerImg.onclick = () => {
            if (energi) {
                showDialog("Система", "Энергия уже подана. Электрощиток работает.");
            } else {
                energi = true;
                saveState();
                enerImg.style.filter = "drop-shadow(0 0 15px #2ecc71)";
                
                // 🆕 Запускаем появление Учителя!
                teacherInBasement = true;
                currentMonologueStep = 0;
                updateScreen(); // Принудительно обновляем экран, чтобы показать Учителя
            }
        };
    } else {
        enerImg.style.display = "none";
    }
        // Персонаж и логика квеста
    const charImg = document.getElementById('character');

    // 1. ПРОВЕРКА: Учитель в подвале (Хоррор-ивент)
    if (currentLoc === "Подвал" && teacherInBasement) {
        charImg.src = "Assets/On.png"; // Картинка учителя
        charImg.style.display = "block";
        charImg.style.filter = "brightness(0.7) contrast(1.2) drop-shadow(0 0 15px red)";
        charImg.onclick = null; // Отключаем обычный клик по спрайту, кликать надо по диалогу
        
        // Запускаем первую реплику монолога
        advanceMonologue();
    } 
    // 2. ПРОВЕРКА: Обычные квестовые персонажи (Связали через else if!)
    else if (loc.char && currentLoc !== "Чердак") {
        if ((currentLoc === 'Класс' && !isNight) || (currentLoc === "Библиотека" && isNight)) {
            charImg.src = loc.char;
            charImg.style.display = "block";
            charImg.style.filter = isNight ? "brightness(0.6) contrast(1.2)" : "none";

            charImg.onclick = () => {
                if (isNight && currentLoc === "Библиотека") {
                    showDialog("???", `Охохо, как же мило ${pName}. Я всегда был здесь и ждал тебя... Я дам тебе печать что спугнёт смотрителя. Но не просто так конечно-же )))
                        Ты ведь прекрасно знаешь меня, я люблю играть в игры, они всегда честные...в мою сторону... ну не суть!
                        Отгадаешь где печать лежит - она твоя. У тебя 3 попыткы, а иначе... )))`);
                    document.getElementById('game-container').classList.add('shake');
                    setTimeout(() => {
                        saveState();
                        window.location.href = "GameGG.html";
                    }, 20000); 
                }
            };
        } else {
            charImg.style.display = "none";
        }
    } 
    // 3. Если персонажей на локации вообще нет
    else {
        charImg.style.display = "none";
    }

        // Чердак: Смотрящий и Радиоприемник
    const smot = document.getElementById('smotritel'); 
    const radioImg = document.getElementById('predmetPr'); 

    if (currentLoc === "Чердак" && isNight) {
        if (!gameGG) {
            smot.src = "Assets/Smot.png";
            smot.style.display = "block";
            radioImg.style.display = "none";

            smot.onclick = () => {
                // Если игрок нажал на Смотрящего, имея печать (gameGG станет true после мини-игры)
                if (gameGG) {
                    showDialog("Смотрящий", "Это печать душ? Ладно, проходи...");
                    smot.style.opacity = "0.5";
                    setTimeout(() => { 
                        smot.style.display = "none"; 
                        updateScreen(); 
                    }, 1500);
                } else {
                    showDialog("Смотрящий", `Тебе здесь не место,${pName}. Уйди прочь, пока я тебя не превратил в тень которая будет волочить свою жизнь в сгустке таких же подобных...`);    
                    setTimeout(() => { 
                        currentLoc = "Коридор"; 
                        updateScreen(); 
                    }, 3000);
                }
            }; 
        } else {
            // Смотрящий побежден — показываем радио
            smot.style.display = "none";
            radioImg.src = "Assets/OldRadio.png";
            radioImg.style.display = "block";
            radioImg.style.cursor = "pointer";
            radioImg.style.left = "40%";
            radioImg.style.top = "45%";
            radioImg.style.height = "25%";

            radioImg.onclick = () => {
                saveState();
                window.location.href = "CherdakGame.html";
            };
        }
    } else {
        smot.style.display = "none";
        if (currentLoc !== "Класс") {
            radioImg.style.display = "none";
        }
    }

    // ВАЖНО: Запускаем проверку квестов и мыслей при каждом обновлении экрана!
    handleLogic(loc);
 // Скобка закрывает функцию updateScreen
}
// 4. Логика автоматических квестов
function handleLogic(loc) {
    if (currentLoc === "Библиотека" && !isNight && !hasBooks) {
        hasBooks = true;
        saveState();
        showDialog(`${pName}`, "И че это я должен таскать эти учебники ? хмм... они довольно тяжелые!");
        return;
    }

    if (currentLoc === "Класс") {
        if (isNight) {
            showDialog(`${pName}`, `Что...в глазах рябит.. где я? ${pName}, соберись... В аудитории так страшно... Где все? На улице уже ночь? Надо уходить!`);
        } else if (hasBooks) {
            showDialog("Учитель", `О, ${pName}, а вот и учебники, наконец-то! Клади на стол и садись... *Что-то не так...меня клонит в сон..н..н*`);
            saveState();
            setTimeout(GoToSleep, 4000);
        } else {
            showDialog("Учитель", `Эй, ${pName}, помоги мне! Сходи в библиотеку за учебниками, мы не начнем урок без них... живее!`);
        }
        return;
    }
    
    if (loc.text && !loc.char) {
        showDialog("Окружение", loc.text);
    }
}

function showDialog(name, text) {
    const box = document.getElementById('dialog-box');
    document.getElementById('char-name').innerText = name;
    document.getElementById('char-text').innerText = text;
    box.style.display = "block";
    box.style.opacity = "1";
}

function move(direction) {
    // 1. ПРОВЕРКА: Попытка зайти в Подвал из Фае без ключа
    if (currentLoc === "Фае" && direction === "down") {
        if (!hasKey) {
            showDialog(`${pName}`, "Дверь в подвал заперта, хмм...где же ключ ?");
            return; // Мгновенно выходим из функции, переход заблокирован!
        }
    }

    // 2. ПРОВЕРКА: Попытка зайти на Чердак из Коридора днем
    if (currentLoc === "Коридор" && direction === "up") {
        if (!isNight) {
            showDialog(`${pName}`, "И зачем мне туда ?");
            return; // Выходим из функции, переход заблокирован!
        }
    }

    // 3. ОБЫЧНЫЙ ПЕРЕХОД (срабатывает, только если проверки выше пройдены успешно)
    const next = locations[currentLoc][direction];
    if (next) {
        playMoveSound(); 
        currentLoc = next;
        saveState();
        updateScreen();
    }
}

// 🆕 МАССИВ РЕПЛИК УЧИТЕЛЯ ДЛЯ ПОДВАЛА
const teacherMonologue = [
    `Щелк... Ай..ай..глаза..зачем так резко то ? Ну и вредина ты ${pName}...`,
    `Что ? Почему глаза округлились ? Монстра увидел ? ахаха...
    Ты реально наделся уйти отсюда ? Зачем, я что-то сделал не так ? 
    Просто пойми, ты еще не принял этот мир, он намного проще и легче...чем реальный...`,
    `${pName} я не хотел навредить тебе, но все что ты прошел или проходишь ради тебя!
    Сколько бы я не сделал препядствий и ловушек, ты их проходишь чтобы обрести свободу...свободу...`,
    `У человека нельзя отнять свободу, чувство что его окрыляет...иначе его и человеком нельзя назвать.
    Может поэтому все те, которых я спас обратились в тень...`,
    "Даже если так, мой...моя сущность не отпустит никого, даже меня. Прости что затянул тебя во все это..."
];

// Функция вывода текущей реплики Учителя
function advanceMonologue() {
    if (currentMonologueStep < teacherMonologue.length) {
        showDialog("Учитель", teacherMonologue[currentMonologueStep]);
    } else {
        // МОНОЛОГ ОКОНЧЕН: Учитель исчезает, подвал разблокирован
        teacherInBasement = false;
        showDialog(`${pName}`, "Ниче не понятно...но интересно.....БУЖИМ!!!");
        updateScreen(); // Перерисовываем экран (вернет кнопку Выхода и спрячет спрайт)
    }
}

// Перехватчик кликов по диалоговому окну
function handleDialogClick() {
    // Если сейчас идет сцена с Учителем в подвале — двигаем монолог по клику
    if (currentLoc === "Подвал" && teacherInBasement) {
        currentMonologueStep++;
        advanceMonologue();
    }
}


function GoToSleep() {
    const screen = document.getElementById('game-container');
    screen.style.transition = "filter 2s, opacity 2s";
    screen.style.filter = "brightness(0)";
    setTimeout(() => {
        isNight = true;
        currentLoc = "Класс";
        screen.style.filter = 'brightness(1)';
        updateScreen();
    }, 2000);
}

function openNote() {
    const loc = locations[currentLoc];
    if (loc && loc.note) {
        document.getElementById('note-title').innerText = loc.note.title;
        document.getElementById('note-text').innerText = loc.note.text;
        document.getElementById('full').style.display = 'block';
    }
}

// Полноценно закрываем и сохраняем переменные
function closeNote() {
    document.getElementById('full').style.display = 'none';
}

function saveState() {
    localStorage.setItem('lastLocation', currentLoc);
    localStorage.setItem('isNightState', isNight);
    localStorage.setItem('energiState', energi);
    localStorage.setItem('hasBooksState', hasBooks);
    localStorage.setItem('hasBasementKey', hasKey);
    localStorage.setItem('gamedaedKey', gameGG);
}


