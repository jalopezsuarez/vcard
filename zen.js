// Timer Worker functionality
class TimerWorker {
    constructor() {
        this.timerId = null;
        this.timeLeft = 0;
        this.callbacks = {
            onTick: null,
            onComplete: null
        };
    }

    start(timeLeft) {
        this.timeLeft = timeLeft;
        if (this.timerId === null) {
            this.timerId = setInterval(() => {
                this.timeLeft--;
                if (this.callbacks.onTick) {
                    this.callbacks.onTick(this.timeLeft);
                }
                if (this.timeLeft <= 0) {
                    this.stop();
                    if (this.callbacks.onComplete) {
                        this.callbacks.onComplete();
                    }
                }
            }, 1000);
        }
    }

    pause() {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    stop() {
        this.pause();
    }

    reset(timeLeft) {
        this.stop();
        this.timeLeft = timeLeft;
        if (this.callbacks.onTick) {
            this.callbacks.onTick(this.timeLeft);
        }
    }

    onTick(callback) {
        this.callbacks.onTick = callback;
    }

    onComplete(callback) {
        this.callbacks.onComplete = callback;
    }
}

// Main application code
document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const timeInput = document.getElementById('timeInput');
    const increaseTimeBtn = document.getElementById('increaseTime');
    const decreaseTimeBtn = document.getElementById('decreaseTime');
    const gongSound = document.getElementById('gongSound');
    const donutCircle = document.querySelector('.donut-circle');
    const quoteElement = document.getElementById('quote');
    const container = document.querySelector('.bg-dark-200');

    // Create timer instance
    const timer = new TimerWorker();
    let totalTime = 0;

    const zenQuotes = [
        // Citas sobre la paz interior
        "La paz viene de dentro. No la busques fuera. - Buda",
        "La mente lo es todo. En lo que piensas te conviertes. - Buda",
        "El silencio es una fuente de gran fuerza. - Lao Tzu",
        "En la quietud es donde se encuentran la creatividad y las soluciones a los problemas. - Eckhart Tolle",
        "No habites en el pasado, no sueñes con el futuro, concentra la mente en el momento presente. - Buda",
        "En medio del caos, también hay oportunidades. - Sun Tzu",
        "Sólo la persona que está quieta puede descubrir su verdadera naturaleza. - Desconocido",
        "Cada respiración que damos, cada paso que damos, puede estar lleno de paz, alegría y serenidad. - Thich Nhat Hanh",
        "Cuanto más silencioso te vuelves, más puedes oír.",
        "Dentro de ti hay una quietud y un santuario al que puedes retirarte en cualquier momento y ser tú mismo. - Hermann Hesse",
        "Cuando la mente está en calma, con qué rapidez, con qué suavidad, con qué belleza percibirás todo. - Paramahansa Yogananda",
        "Estar en calma es el logro más elevado del ser. - Proverbio Zen",
        "La calma es la cuna del poder. - Josiah Gilbert Holland",
        "Es en tus momentos de decisión donde se forja tu destino. - Tony Robbins",
        "La verdadera paz viene de conocerte a ti mismo. - Dalai Lama",

        // Citas para Mindfulness
        "Cuando camines, camina. Cuando comas, come. - Proverbio Zen",
        "El momento presente es el único tiempo sobre el que tenemos dominio. - Thích Nhất Hạnh",
        "Mindfulness no es difícil, sólo tenemos que acordarnos de hacerlo. - Sharon Salzberg",
        "Cada mañana, nacemos de nuevo. Lo que hacemos hoy es lo que más importa. - Buda",
        "Sé feliz en el momento, eso es suficiente. Cada momento es todo lo que necesitamos, no más. - Madre Teresa",
        "Los sentimientos van y vienen como nubes en un cielo ventoso. La respiración consciente es mi ancla. - Thich Nhat Hanh",
        "El mayor esfuerzo no se preocupa por los resultados. - Atisha",
        "El hábito de pasar casi todas las horas de vigilia perdidos en el pensamiento nos deja a merced de lo que sean nuestros pensamientos. - Sam Harris",
        "La conciencia es como el sol. Cuando brilla sobre las cosas, éstas se transforman. - Thich Nhat Hanh",
        "Observa sin evaluar. Esta es la forma más elevada de inteligencia. - Jiddu Krishnamurti",
        "Inspirando, calmo cuerpo y mente. Al espirar, sonrío. - Thich Nhat Hanh",
        "Estate aquí ahora. - Ram Dass",
        "Cuando estamos presentes en cada momento, el pasado rueda suavemente detrás de nosotros y el futuro se desenreda lentamente ante nosotros. - Richard Moss",
        "La mente es como el agua. Cuando está turbulenta, es difícil de ver. Cuando está en calma, todo se vuelve claro. - Prasad Mahes",

        // Citas sobre la Gratitud
        "Reconocer lo bueno que ya tienes en tu vida es la base de toda abundancia. - Eckhart Tolle",
        "La gratitud convierte lo que tenemos en suficiente. - Aesop",
        "La gratitud es la memoria del corazón. - Jean Baptiste Massieu",
        "La gratitud es la llave que abre la puerta a la abundancia. - Desconocido",
        "La gratitud hace sentido de nuestro pasado, trae paz para hoy, y crea una visión para el mañana. - Melody Beattie",
        "La gratitud es la forma más saludable de las emociones humanas. - Hans Selye",
        "La gratitud es la mejor actitud. - Desconocido",
        "La gratitud es la memoria del corazón. - Lao Tzu",
        "La gratitud es la virtud más noble. - Cicero",
        "La gratitud es la forma más elevada de pensamiento. - GK Chesterton",

        // Citas sobre la Simplicidad
        "La simplicidad es la sofisticación definitiva. - Leonardo da Vinci",
        "La capacidad de simplificar significa eliminar lo innecesario para que hable lo necesario. - Hans Hofmann",
        "La naturaleza se complace en la simplicidad. - Isaac Newton",
        "La sencillez es hacer el viaje de esta vida con el equipaje justo y suficiente. - Charles Dudley Warner",
        "La mayor riqueza es vivir contento con poco. - Platón",
        "La sencillez es la nota clave de toda verdadera elegancia. - Coco Chanel",
        "Vive sencillamente para que otros puedan sencillamente vivir. - Mahatma Gandhi",
        "La sencillez se reduce a dos pasos: Identifica lo esencial. Elimina el resto. - Leo Babauta",
        "Una vida sencilla no es ver con qué poco podemos arreglárnoslas -eso es pobreza-, sino con qué eficacia podemos poner lo primero en primer lugar. - Victoria Moran",
        "Complicar es fácil. Simplificar es difícil. - Bruno Munari",
        "Cuanto más simples somos, más completos nos volvemos. - August Rodin",
        "Menos es más. - Ludwig Mies van der Rohe",
        "La sencillez es la naturaleza de las grandes almas. - Papa Ramadas",
        "Las cosas más sencillas son a menudo las más verdaderas. - Richard Bach",

        // Citas para la Aceptación
        "La aceptación es la clave de todo. - Michael J. Fox",
        "Lo que niegas o ignoras, lo retrasas. Lo que aceptas y afrontas, lo conquistas. - Robert Tew",
        "La paz es aceptar el hoy, soltar el ayer y renunciar a la necesidad de controlar el mañana. - Lori Deschene",
        "La única forma de dar sentido al cambio es zambullirse en él, moverse con él y unirse a la danza. - Alan Watts",
        "La aceptación radical descansa en soltar la ilusión de control y en la voluntad de notar y aceptar las cosas tal y como son ahora mismo, sin juzgarlas. - Marsha M. Linehan",
        "Cuando no puedas controlar lo que está sucediendo, desafíate a controlar la forma en que respondes a lo que está sucediendo. Ahí es donde está tu poder. - Desconocido",
        "Ser visto plenamente por alguien, entonces, y ser amado de todos modos-esto es una ofrenda humana que puede rayar en lo milagroso. - Elizabeth Gilbert",
        "La aceptación de lo ocurrido es el primer paso para superar las consecuencias de cualquier desgracia. - William James",
        "La vida es una serie de cambios naturales y espontáneos. No te resistas a ellos; eso sólo crea tristeza. - Lao Tzu",
        "Si te irritas con cada roce, ¿cómo te pulirás? - Rumi",
        "La aceptación no significa resignación; significa comprender que algo es lo que es y que tiene que haber una forma de superarlo. - Michael J. Fox",
        "La felicidad sólo puede existir en la aceptación. - George Orwell",
        "El mayor regalo que puedes hacer a los demás es el regalo del amor incondicional y la aceptación. - Brian Tracy",
        "El corazón de la aceptación es dejar ir la necesidad de cambiar las cosas y permitir que la vida misma se desarrolle. - Desconocido"
    ];

    function getRandomQuote() {
        const randomIndex = Math.floor(Math.random() * zenQuotes.length);
        return zenQuotes[randomIndex];
    }

    // Cargar el último tiempo usado o usar 5 minutos por defecto
    let timeLeft = parseInt(localStorage.getItem('lastMeditationTime')) || 300;
    totalTime = timeLeft;

    // Actualizar el input con el último tiempo usado
    timeInput.value = Math.floor(timeLeft / 60);

    function playGong() {
        gongSound.currentTime = 0;
        gongSound.play();
    }

    function updateTimerDisplay(timeLeft) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Actualizar la donut
        const progress = (timeLeft / totalTime) * 283;
        donutCircle.style.strokeDashoffset = progress;
    }

    function updateTimeFromInput() {
        const minutes = parseInt(timeInput.value);
        if (minutes >= 1 && minutes <= 60) {
            timeLeft = minutes * 60;
            totalTime = timeLeft;
            updateTimerDisplay(timeLeft);
            // Guardar el tiempo en localStorage
            localStorage.setItem('lastMeditationTime', timeLeft.toString());
        }
    }

    function showCompletionNotification() {
        container.classList.add('animate-pulse');
        container.classList.add('ring-2', 'ring-emerald-500');
        setTimeout(() => {
            container.classList.remove('animate-pulse', 'ring-2', 'ring-emerald-500');
        }, 2000);
    }

    // Configurar callbacks del timer
    timer.onTick(updateTimerDisplay);
    timer.onComplete(() => {
        playGong();
        showCompletionNotification();
    });

    // Event listeners
    startBtn.addEventListener('click', () => {
        updateTimeFromInput();
        playGong();
        timer.start(timeLeft);
        quoteElement.textContent = getRandomQuote();
    });

    pauseBtn.addEventListener('click', () => {
        timer.pause();
    });

    increaseTimeBtn.addEventListener('click', () => {
        const currentValue = parseInt(timeInput.value);
        if (currentValue < 60) {
            timeInput.value = currentValue + 1;
            updateTimeFromInput();
        }
    });

    decreaseTimeBtn.addEventListener('click', () => {
        const currentValue = parseInt(timeInput.value);
        if (currentValue > 1) {
            timeInput.value = currentValue - 1;
            updateTimeFromInput();
        }
    });

    timeInput.addEventListener('change', updateTimeFromInput);

    // Initialize timer display
    updateTimerDisplay(timeLeft);
}); 