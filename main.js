class LottoGenerator extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        // Define the template
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                .lotto-container {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .ball {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: white;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    animation: pop-in 0.3s ease-out forwards;
                }
                @keyframes pop-in {
                    0% { transform: scale(0); opacity: 0; }
                    80% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }

                /* Ball Colors */
                .ball:nth-child(1) { background: linear-gradient(135deg, #FFD700, #FFA500); } /* Gold to Orange */
                .ball:nth-child(2) { background: linear-gradient(135deg, #87CEEB, #4682B4); } /* SkyBlue to SteelBlue */
                .ball:nth-child(3) { background: linear-gradient(135deg, #98FB98, #3CB371); } /* PaleGreen to MediumSeaGreen */
                .ball:nth-child(4) { background: linear-gradient(135deg, #FFB6C1, #FF69B4); } /* LightPink to HotPink */
                .ball:nth-child(5) { background: linear-gradient(135deg, #DDA0DD, #BA55D3); } /* Plum to MediumOrchid */
                .ball:nth-child(6) { background: linear-gradient(135deg, #F08080, #CD5C5C); } /* LightCoral to IndianRed */

                button {
                    padding: 15px 30px;
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: white;
                    background: linear-gradient(135deg, #6a11cb, #2575fc);
                    border: none;
                    border-radius: 50px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                }

                button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(37, 117, 252, 0.4);
                }

                button:active {
                    transform: translateY(-1px);
                    box-shadow: 0 5px 15px rgba(37, 117, 252, 0.3);
                }

            </style>
            <div class="lotto-container" id="lotto-container"></div>
            <button id="generate-btn">Generate Numbers</button>
        `;

        shadow.appendChild(template.content.cloneNode(true));

        this.lottoContainer = shadow.getElementById('lotto-container');
        this.generateBtn = shadow.getElementById('generate-btn');

        this.generateBtn.addEventListener('click', () => this.generateNumbers());
    }

    generateNumbers() {
        this.lottoContainer.innerHTML = ''; // Clear previous numbers
        const numbers = new Set();
        while (numbers.size < 6) {
            numbers.add(Math.floor(Math.random() * 45) + 1);
        }

        const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

        sortedNumbers.forEach((number, index) => {
            setTimeout(() => {
                const ball = document.createElement('div');
                ball.className = 'ball';
                ball.textContent = number;
                this.lottoContainer.appendChild(ball);
            }, index * 100); // Stagger the animation
        });
    }
}

customElements.define('lotto-generator', LottoGenerator);

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
});
