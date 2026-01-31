// Функция для инициализации рисования в paint
function initPainting() {
    const paintElement = document.querySelector('.paint');
    if (!paintElement) return;
    
    // Сохраняем оригинальные размеры и стили
    const originalWidth = paintElement.style.width || '668px';
    const originalHeight = paintElement.style.height || '522px';
    
    // Полностью очищаем содержимое paint
    paintElement.innerHTML = '';
    
    // Устанавливаем позиционирование и размеры
    paintElement.style.position = 'relative';
    paintElement.style.overflow = 'hidden';
    paintElement.style.width = originalWidth;
    paintElement.style.height = originalHeight;
    paintElement.style.backgroundColor = 'white';
    paintElement.style.border = '5px solid black';
    
    // Создаем палитру цветов
    const colors = [
        '#000000', // черный
        '#FE3E36', // красный (как в полосах)
        '#2E5BFF', // синий
        '#2ED573', // зеленый
        '#FFD700'  // желтый
    ];
    
    // Создаем контейнер для палитры
    const palette = document.createElement('div');
    palette.style.cssText = `
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        padding: 8px;
        background: white;
        border: 2px solid black;
        border-radius: 8px;
        z-index: 100;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    // Добавляем текст к палитре
    const paletteLabel = document.createElement('span');
    paletteLabel.textContent = 'Цвета: ';
    paletteLabel.style.cssText = `
        font-family: 'Anonymous Pro', sans-serif;
        font-size: 14px;
        margin-right: 5px;
        line-height: 30px;
    `;
    palette.appendChild(paletteLabel);
    
    // Создаем цветные кнопки в палитре
    let currentColor = colors[0];
    
    colors.forEach(color => {
        const colorBtn = document.createElement('div');
        colorBtn.style.cssText = `
            width: 30px;
            height: 30px;
            background-color: ${color};
            border: 2px solid ${color === currentColor ? '#000' : '#ccc'};
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.2s;
        `;
        
        colorBtn.addEventListener('mouseover', () => {
            colorBtn.style.transform = 'scale(1.1)';
        });
        
        colorBtn.addEventListener('mouseout', () => {
            colorBtn.style.transform = 'scale(1)';
        });
        
        colorBtn.addEventListener('click', () => {
            currentColor = color;
            // Обновляем границы всех кнопок
            palette.querySelectorAll('div').forEach(btn => {
                btn.style.border = `2px solid ${btn.style.backgroundColor === color ? '#000' : '#ccc'}`;
            });
        });
        
        palette.appendChild(colorBtn);
    });
    
    paintElement.appendChild(palette);
    
    // Создаем контейнер для рисования (будет содержать все точки)
    const drawingArea = document.createElement('div');
    drawingArea.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    paintElement.appendChild(drawingArea);
    
    // Переменные для отслеживания состояния рисования
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    const brushSize = 8; // Увеличим размер кисти для лучшей видимости
    
    // Функция для получения координат относительно paint
    function getPaintCoordinates(e) {
        const rect = paintElement.getBoundingClientRect();
        let x, y;
        
        if (e.type.includes('touch')) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        
        // Ограничиваем координаты границами paint
        x = Math.max(brushSize, Math.min(x, rect.width - brushSize));
        y = Math.max(brushSize, Math.min(y, rect.height - brushSize));
        
        return { x, y };
    }
    
    // Функция рисования точки
    function drawPoint(x, y) {
        const point = document.createElement('div');
        point.style.cssText = `
            position: absolute;
            left: ${x - brushSize/2}px;
            top: ${y - brushSize/2}px;
            width: ${brushSize}px;
            height: ${brushSize}px;
            background-color: ${currentColor};
            border-radius: 50%;
            pointer-events: none;
            z-index: 2;
        `;
        drawingArea.appendChild(point);
    }
    
    // Функция рисования линии между точками
    function drawLine(x1, y1, x2, y2) {
        // Вычисляем расстояние между точками
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        if (distance === 0) {
            drawPoint(x1, y1);
            return;
        }
        
        // Интерполируем точки между началом и концом
        const steps = Math.max(2, Math.floor(distance / (brushSize/2)));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            drawPoint(x, y);
        }
    }
    
    // Обработчики событий мыши
    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        const { x, y } = getPaintCoordinates(e);
        lastX = x;
        lastY = y;
        drawPoint(x, y);
    }
    
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const { x, y } = getPaintCoordinates(e);
        
        // Рисуем линию от предыдущей точки к текущей
        drawLine(lastX, lastY, x, y);
        
        lastX = x;
        lastY = y;
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    // Добавляем обработчики событий для мыши
    paintElement.addEventListener('mousedown', startDrawing);
    paintElement.addEventListener('mousemove', draw);
    paintElement.addEventListener('mouseup', stopDrawing);
    paintElement.addEventListener('mouseleave', stopDrawing);
    
    // Предотвращаем контекстное меню на элементе paint
    paintElement.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Кнопка очистки
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Очистить рисунок';
    clearBtn.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        padding: 8px 16px;
        background: #FE3E36;
        color: white;
        border: 2px solid black;
        border-radius: 5px;
        cursor: pointer;
        font-family: 'Anonymous Pro', sans-serif;
        font-size: 14px;
        font-weight: bold;
        z-index: 100;
        transition: background-color 0.2s;
    `;
    
    clearBtn.addEventListener('mouseover', () => {
        clearBtn.style.backgroundColor = '#ff5555';
    });
    
    clearBtn.addEventListener('mouseout', () => {
        clearBtn.style.backgroundColor = '#FE3E36';
    });
    
    clearBtn.addEventListener('click', () => {
        drawingArea.innerHTML = '';
    });
    
    paintElement.appendChild(clearBtn);
    
}

// Инициализируем рисование после загрузки страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPainting);
} else {
    initPainting();
}
function initMusicNotes() {
    const musicElement = document.querySelector('.music');
    const notes = document.querySelectorAll('.music .note');
    
    if (!musicElement || notes.length === 0) return;
    
    // Частоты для нот (C4 до B4 - одна октава)
    const noteFrequencies = [
        261.63, // C4
        293.66, // D4
        329.63, // E4
        349.23, // F4
        392.00, // G4
        440.00, // A4
        493.88  // B4
    ];
    
    // Создаем аудиоконтекст
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Функция для воспроизведения звука
    function playNote(frequency) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine'; // Тип волны: sine, square, sawtooth, triangle
        
        // Настройки огибающей звука
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    // Функция для создания анимированной ноты
    function createAnimatedNote(originalNote, noteIndex) {
        // Клонируем ноту
        const clonedNote = originalNote.cloneNode(true);
        
        // Устанавливаем начальную позицию (такую же, как у оригинала)
        const originalRect = originalNote.getBoundingClientRect();
        const musicRect = musicElement.getBoundingClientRect();
        
        const relativeX = originalRect.left - musicRect.left;
        const relativeY = originalRect.top - musicRect.top;
        
        clonedNote.style.cssText = `
            position: absolute;
            left: ${relativeX}px;
            top: ${relativeY}px;
            width: 100px;
            height: 100px;
            background-color: black;
            border-radius: 100px;
            z-index: 10;
            pointer-events: none;
        `;
        
        // Добавляем клон в music
        musicElement.appendChild(clonedNote);
        
        // Воспроизводим звук ноты
        const frequency = noteFrequencies[noteIndex % noteFrequencies.length];
        playNote(frequency);
        
        // Анимация движения вверх
        const startTime = Date.now();
        const duration = 2000; // 2 секунды
        const startY = relativeY;
        const endY = -150; // Выезжает за верхнюю границу
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Плавное движение с ease-out
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentY = startY + (endY - startY) * easeProgress;
            
            clonedNote.style.top = `${currentY}px`;
            
            // Изменяем прозрачность при приближении к верху
            if (progress > 0.7) {
                clonedNote.style.opacity = 1 - (progress - 0.7) / 0.3;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Удаляем ноту после завершения анимации
                if (clonedNote.parentNode === musicElement) {
                    musicElement.removeChild(clonedNote);
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Добавляем обработчики кликов на каждую ноту
    notes.forEach((note, index) => {
        note.style.cursor = 'pointer';
        note.style.transition = 'transform 0.1s';
        
        note.addEventListener('mousedown', (e) => {
            e.preventDefault();
            // Эффект нажатия
            note.style.transform = 'scale(0.9)';
            
            // Создаем анимированную ноту
            createAnimatedNote(note, index);
        });
        
        note.addEventListener('mouseup', () => {
            note.style.transform = 'scale(1)';
        });
        
        note.addEventListener('mouseleave', () => {
            note.style.transform = 'scale(1)';
        });
        
        // Для мобильных устройств
        note.addEventListener('touchstart', (e) => {
            e.preventDefault();
            note.style.transform = 'scale(0.9)';
            createAnimatedNote(note, index);
            
            // Возвращаем размер после задержки
            setTimeout(() => {
                note.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Устанавливаем позиционирование для music
    musicElement.style.position = 'relative';
    musicElement.style.overflow = 'hidden';
}

// Инициализируем оба функционала после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    initPainting();
    initMusicNotes();
});

function initChineseTest() {
    const chinaElement = document.querySelector('.china');
    if (!chinaElement) return;
    
    // Очищаем содержимое
    chinaElement.innerHTML = '';
    
    // Устанавливаем стили
    chinaElement.style.position = 'relative';
    chinaElement.style.overflow = 'hidden';
    chinaElement.style.backgroundColor = 'white';
    chinaElement.style.border = '5px solid black';
    chinaElement.style.width = '668px';
    chinaElement.style.height = '522px';
    chinaElement.style.padding = '20px';
    chinaElement.style.boxSizing = 'border-box';
    
    // Данные для теста: 10 вопросов с правильными ответами
    const testQuestions = [
    {
        russian: "Человек",
        options: ["人", "大", "口", "手"],
        correct: 0
    },
    {
        russian: "Сердце",
        options: ["心", "火", "目", "耳"],
        correct: 0
    },
    {
        russian: "Путь",
        options: ["道", "路", "走", "行"],
        correct: 0
    },
    {
        russian: "Снег",
        options: ["雪", "雨", "冰", "冷"],
        correct: 0
    },
    {
        russian: "Вода",
        options: ["水", "河", "海", "湖"],
        correct: 0
    },
    {
        russian: "Огонь",
        options: ["火", "炎", "熱", "光"],
        correct: 0
    },
    {
        russian: "Гора",
        options: ["山", "高", "岩", "峰"],
        correct: 0
    },
    {
        russian: "Дерево",
        options: ["木", "林", "森", "枝"],
        correct: 0
    },
    {
        russian: "Солнце",
        options: ["日", "陽", "光", "明"],
        correct: 0
    },
    {
        russian: "Луна",
        options: ["月", "夜", "明", "光"],
        correct: 0
    }
];
    
    let currentQuestion = 0;
    let userAnswers = [];
    
    // Функция для отображения вопроса
    function showQuestion() {
        chinaElement.innerHTML = '';
        
        if (currentQuestion >= testQuestions.length) {
            showResults();
            return;
        }
        
        const question = testQuestions[currentQuestion];
        
        // Создаем контейнер для вопроса
        const questionContainer = document.createElement('div');
        questionContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: 30px;
        `;
        
        // Номер вопроса
        const questionNumber = document.createElement('div');
        questionNumber.textContent = `Вопрос ${currentQuestion + 1} из ${testQuestions.length}`;
        questionNumber.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            color: #333;
        `;
        
        // Слово на русском
        const russianWord = document.createElement('div');
        russianWord.textContent = question.russian;
        russianWord.style.cssText = `
            font-size: 48px;
            font-weight: bold;
            color: #000;
            text-align: center;
            margin-bottom: 20px;
        `;
        
        // Контейнер для вариантов ответа
        const optionsContainer = document.createElement('div');
        optionsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            width: 80%;
            max-width: 500px;
        `;
        
        // Создаем кнопки для вариантов ответа
        question.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.textContent = option;
            optionButton.style.cssText = `
                padding: 15px;
                font-size: 36px;
                background-color: #f0f0f0;
                border: 2px solid #ccc;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                font-family: 'Anonymous Pro', sans-serif;
            `;
            
            optionButton.addEventListener('mouseover', () => {
                optionButton.style.backgroundColor = '#e0e0e0';
                optionButton.style.transform = 'translateY(-2px)';
            });
            
            optionButton.addEventListener('mouseout', () => {
                optionButton.style.backgroundColor = '#f0f0f0';
                optionButton.style.transform = 'translateY(0)';
            });
            
            optionButton.addEventListener('click', () => {
                // Сохраняем ответ
                userAnswers[currentQuestion] = index;
                
                // Подсветка выбранного ответа
                optionButton.style.backgroundColor = '#2E5BFF';
                optionButton.style.color = 'white';
                optionButton.style.borderColor = '#2E5BFF';
                
                // Переход к следующему вопросу через 0.5 секунды
                setTimeout(() => {
                    currentQuestion++;
                    showQuestion();
                }, 500);
            });
            
            optionsContainer.appendChild(optionButton);
        });
        
        questionContainer.appendChild(questionNumber);
        questionContainer.appendChild(russianWord);
        questionContainer.appendChild(optionsContainer);
        chinaElement.appendChild(questionContainer);
    }
    
    // Функция для показа результатов
    function showResults() {
        // Подсчет правильных ответов
        let correctCount = 0;
        testQuestions.forEach((question, index) => {
            if (userAnswers[index] === question.correct) {
                correctCount++;
            }
        });
        
        const percentage = (correctCount / testQuestions.length) * 100;
        
        chinaElement.innerHTML = '';
        
        const resultsContainer = document.createElement('div');
        resultsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: 30px;
            text-align: center;
            padding: 20px;
        `;
        
        // Заголовок
        const title = document.createElement('div');
        title.textContent = 'Результаты теста';
        title.style.cssText = `
            font-size: 36px;
            font-weight: bold;
            color: #000;
        `;
        
        // Результат
        const result = document.createElement('div');
        result.textContent = `Правильных ответов: ${correctCount} из ${testQuestions.length}`;
        result.style.cssText = `
            font-size: 24px;
            color: #333;
        `;
        
        // Процент
        const percentageText = document.createElement('div');
        percentageText.textContent = `Вы на ${percentage.toFixed(0)}% китаец!`;
        percentageText.style.cssText = `
            font-size: 48px;
            font-weight: bold;
            color: ${percentage >= 80 ? '#2ED573' : percentage >= 50 ? '#FFD700' : '#FE3E36'};
            margin-top: 20px;
        `;
        
        // Шкала прогресса
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 80%;
            height: 30px;
            background-color: #f0f0f0;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
            border: 2px solid #333;
        `;
        
        const progressFill = document.createElement('div');
        progressFill.style.cssText = `
            width: ${percentage}%;
            height: 100%;
            background-color: ${percentage >= 80 ? '#2ED573' : percentage >= 50 ? '#FFD700' : '#FE3E36'};
            transition: width 1s ease-in-out;
        `;
        progressBar.appendChild(progressFill);
        
        // Сообщение в зависимости от результата
        const message = document.createElement('div');
        let messageText = '';
        if (percentage >= 90) {
            messageText = 'Вы практически настоящий китаец! 恭喜!';
        } else if (percentage >= 70) {
            messageText = 'Отличный результат! Вы хорошо знаете китайский!';
        } else if (percentage >= 50) {
            messageText = 'Неплохо! Продолжайте изучать китайский!';
        } else if (percentage >= 30) {
            messageText = 'Есть куда стремиться! Учите китайский!';
        } else {
            messageText = 'Пора начинать изучать китайский! 加油!';
        }
        message.textContent = messageText;
        message.style.cssText = `
            font-size: 20px;
            color: #666;
            max-width: 80%;
            line-height: 1.5;
        `;
        
        // Кнопка перезапуска
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Пройти тест еще раз';
        restartButton.style.cssText = `
            padding: 15px 30px;
            font-size: 18px;
            background-color: #FE3E36;
            color: white;
            border: 2px solid black;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Anonymous Pro', sans-serif;
            font-weight: bold;
            margin-top: 20px;
            transition: background-color 0.2s;
        `;
        
        restartButton.addEventListener('mouseover', () => {
            restartButton.style.backgroundColor = '#ff5555';
        });
        
        restartButton.addEventListener('mouseout', () => {
            restartButton.style.backgroundColor = '#FE3E36';
        });
        
        restartButton.addEventListener('click', () => {
            currentQuestion = 0;
            userAnswers = [];
            showQuestion();
        });
        
        resultsContainer.appendChild(title);
        resultsContainer.appendChild(result);
        resultsContainer.appendChild(progressBar);
        resultsContainer.appendChild(percentageText);
        resultsContainer.appendChild(message);
        resultsContainer.appendChild(restartButton);
        chinaElement.appendChild(resultsContainer);
    }
    
    // Начинаем тест
    showQuestion();
}

// Инициализируем все функционалы после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    initPainting();
    initMusicNotes();
    initChineseTest();
});