
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const upBtn = document.getElementById('upBtn');
        const downBtn = document.getElementById('downBtn');
        const startBtn = document.getElementById('startBtn');

        let gameRunning = false;
        let gameSpeed = 5;
        let distance = 0;
        let animationId;

        // Configuration
        const roadWidth = canvas.width;
        const roadHeight = canvas.height;
        const laneHeight = roadHeight / 2;
        const finishLine = 500; // Distance pour finir

        // Voiture
        const car = {
            x: 50,
            y: laneHeight / 2 - 20,
            width: 60,
            height: 40,
            lane: 0, // 0 = haut, 1 = bas
            targetY: laneHeight / 2 - 20
        };

        // Obstacles fixes positionnés sur la route
        let obstacles = [
            { x: 300, lane: 1 },
            { x: 500, lane: 0 },
            { x: 700, lane: 1 },
            { x: 900, lane: 0 },
            { x: 1100, lane: 1 },
            { x: 1300, lane: 0 },
            { x: 1500, lane: 1 },
            { x: 1700, lane: 0 },
            { x: 1900, lane: 1 },
            { x: 2100, lane: 0 },
            { x: 2300, lane: 1 },
            { x: 2500, lane: 0 }
        ];

        const obstacleWidth = 50;
        const obstacleHeight = 40;

        // Ligne d'arrivée
        const finishLineX = 2700;

        // Dessiner la route
        function drawRoad() {
            ctx.fillStyle = '#555';
            ctx.fillRect(0, 0, roadWidth, roadHeight);

            // Ligne de séparation
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.setLineDash([20, 15]);
            ctx.beginPath();
            ctx.moveTo(0, roadHeight / 2);
            ctx.lineTo(roadWidth, roadHeight / 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Bordures
            ctx.strokeStyle = '#ff0';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, 5);
            ctx.lineTo(roadWidth, 5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, roadHeight - 5);
            ctx.lineTo(roadWidth, roadHeight - 5);
            ctx.stroke();
        }

        // Dessiner la voiture
        function drawCar() {
            ctx.fillStyle = '#f00';
            ctx.fillRect(car.x, car.y, car.width, car.height);
            
            // Fenêtre
            ctx.fillStyle = '#00f';
            ctx.fillRect(car.x + 10, car.y + 8, 25, 24);
            
            // Phares
            ctx.fillStyle = '#ff0';
            ctx.fillRect(car.x + car.width - 5, car.y + 5, 5, 10);
            ctx.fillRect(car.x + car.width - 5, car.y + car.height - 15, 5, 10);

            // Roues
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(car.x + 15, car.y, 8, 0, Math.PI * 2);
            ctx.arc(car.x + 15, car.y + car.height, 8, 0, Math.PI * 2);
            ctx.arc(car.x + car.width - 10, car.y, 8, 0, Math.PI * 2);
            ctx.arc(car.x + car.width - 10, car.y + car.height, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Dessiner un obstacle
        function drawObstacle(x, y) {
            ctx.fillStyle = '#888';
            ctx.fillRect(x, y, obstacleWidth, obstacleHeight);
            
            ctx.fillStyle = '#666';
            ctx.fillRect(x + 5, y + 5, obstacleWidth - 10, obstacleHeight - 10);
            
            ctx.strokeStyle = '#f00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + obstacleWidth, y + obstacleHeight);
            ctx.moveTo(x + obstacleWidth, y);
            ctx.lineTo(x, y + obstacleHeight);
            ctx.stroke();
        }

        // Dessiner la ligne d'arrivée
        function drawFinishLine(x) {
            if (x < 0 || x > roadWidth) return;
            
            ctx.fillStyle = '#fff';
            for (let i = 0; i < roadHeight; i += 40) {
                ctx.fillRect(x, i, 20, 20);
                ctx.fillStyle = ctx.fillStyle === '#fff' ? '#000' : '#fff';
            }
        }

        // Déplacer la voiture
        function updateCarPosition() {
            const diff = car.targetY - car.y;
            if (Math.abs(diff) > 2) {
                car.y += diff * 0.2;
            } else {
                car.y = car.targetY;
            }
        }

        // Détecter les collisions
        function checkCollision() {
            for (let obs of obstacles) {
                const obsX = obs.x - distance;
                const obsY = obs.lane === 0 ? laneHeight / 2 - 20 : laneHeight + laneHeight / 2 - 20;
                
                if (obsX < 0 || obsX > roadWidth) continue;
                
                if (car.x < obsX + obstacleWidth &&
                    car.x + car.width > obsX &&
                    car.y < obsY + obstacleHeight &&
                    car.y + car.height > obsY) {
                    return true;
                }
            }
            return false;
        }

        // Mettre à jour le jeu
        function update() {
            if (!gameRunning) return;

            ctx.clearRect(0, 0, roadWidth, roadHeight);
            drawRoad();

            // Avancer automatiquement
            distance += gameSpeed * 0.1;
            document.getElementById('distance').textContent = Math.floor(distance);

            // Vérifier la ligne d'arrivée
            const finishLinePos = finishLineX - distance;
            drawFinishLine(finishLinePos);

            if (distance >= finishLineX - 100) {
                gameRunning = false;
                alert('🏁 Félicitations ! Vous avez terminé la course !');
                resetGame();
                return;
            }

            // Dessiner les obstacles
            for (let obs of obstacles) {
                const obsX = obs.x - distance;
                if (obsX > -obstacleWidth && obsX < roadWidth + obstacleWidth) {
                    const obsY = obs.lane === 0 ? laneHeight / 2 - 20 : laneHeight + laneHeight / 2 - 20;
                    drawObstacle(obsX, obsY);
                }
            }

            updateCarPosition();
            drawCar();

            // Vérifier collision
            if (checkCollision()) {
                gameRunning = false;
                alert('💥 Collision ! Vous avez perdu !');
                resetGame();
                return;
            }

            animationId = requestAnimationFrame(update);
        }

        // Augmenter la vitesse
        setInterval(() => {
            if (gameRunning && gameSpeed < 15) {
                gameSpeed += 0.3;
                document.getElementById('speed').textContent = gameSpeed.toFixed(1);
            }
        }, 2000);

        // Démarrer le jeu
        function startGame() {
            gameRunning = true;
            gameSpeed = 5;
            distance = 0;
            car.y = laneHeight / 2 - 20;
            car.targetY = laneHeight / 2 - 20;
            car.lane = 0;
            
            document.getElementById('distance').textContent = '0';
            document.getElementById('speed').textContent = gameSpeed;
            startBtn.textContent = 'EN COURS...';
            startBtn.disabled = true;
            upBtn.disabled = false;
            downBtn.disabled = false;
            
            update();
        }

        function resetGame() {
            startBtn.textContent = 'DÉMARRER';
            startBtn.disabled = false;
            upBtn.disabled = true;
            downBtn.disabled = true;
            ctx.clearRect(0, 0, roadWidth, roadHeight);
            drawRoad();
            car.y = laneHeight / 2 - 20;
            drawCar();
        }

        // Contrôles
        upBtn.addEventListener('click', () => {
            if (!gameRunning) return;
            car.lane = 0;
            car.targetY = laneHeight / 2 - 20;
        });

        downBtn.addEventListener('click', () => {
            if (!gameRunning) return;
            car.lane = 1;
            car.targetY = laneHeight + laneHeight / 2 - 20;
        });

        startBtn.addEventListener('click', startGame);

        // État initial
        upBtn.disabled = true;
        downBtn.disabled = true;
        drawRoad();
        drawCar();
   