
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Ajuster le canvas à la largeur de la fenêtre, hauteur fixe
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = 400;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Variables du jeu
        let gameRunning = true;
        let carLane = 1; // 0 = haut, 1 = bas
        let carX = 50;
        let roadOffset = 0;
        let speed = 2;
        let distance = 0;
        let finishLine = 3000;
        
        // Obstacles
        let obstacles = [];
        
        // Dimensions
        const laneHeight = canvas.height / 2;
        const carWidth = 60;
        const carHeight = 40;
        
        // Initialiser les obstacles
        function initObstacles() {
            obstacles = [];
            for (let i = 300; i < finishLine; i += 200 + Math.random() * 150) {
                obstacles.push({
                    x: i,
                    lane: Math.floor(Math.random() * 2),
                    width: 50,
                    height: 35
                });
            }
        }
        
        initObstacles();
        
        // Dessiner la route
        function drawRoad() {
            // Route
            ctx.fillStyle = '#555';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Ligne centrale
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 4;
            ctx.setLineDash([20, 15]);
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Lignes de bord
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 5);
            ctx.lineTo(canvas.width, 5);
            ctx.moveTo(0, canvas.height - 5);
            ctx.lineTo(canvas.width, canvas.height - 5);
            ctx.stroke();
            
            // Marqueurs de distance
            let offset = roadOffset % 100;
            for (let i = -offset; i < canvas.width; i += 100) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(i, 0, 2, canvas.height);
            }
        }
        
        // Dessiner la voiture
        function drawCar() {
            const carY = carLane * laneHeight + laneHeight / 2 - carHeight / 2;
            
            // Corps de la voiture
            ctx.fillStyle = '#FF4444';
            ctx.fillRect(carX, carY, carWidth, carHeight);
            
            // Fenêtres
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(carX + 35, carY + 8, 20, 24);
            
            // Roues
            ctx.fillStyle = '#222';
            ctx.fillRect(carX + 10, carY - 5, 12, 8);
            ctx.fillRect(carX + 10, carY + carHeight - 3, 12, 8);
            ctx.fillRect(carX + carWidth - 22, carY - 5, 12, 8);
            ctx.fillRect(carX + carWidth - 22, carY + carHeight - 3, 12, 8);
            
            // Phares
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(carX + carWidth - 3, carY + 8, 3, 8);
            ctx.fillRect(carX + carWidth - 3, carY + carHeight - 16, 3, 8);
        }
        
        // Dessiner les obstacles
        function drawObstacles() {
            obstacles.forEach(obs => {
                const screenX = obs.x - roadOffset;
                
                if (screenX > -obs.width && screenX < canvas.width) {
                    const obsY = obs.lane * laneHeight + laneHeight / 2 - obs.height / 2;
                    
                    // Obstacle (baril)
                    ctx.fillStyle = '#FF6B35';
                    ctx.fillRect(screenX, obsY, obs.width, obs.height);
                    
                    ctx.fillStyle = '#C44D2C';
                    ctx.fillRect(screenX + 5, obsY + 5, obs.width - 10, 5);
                    ctx.fillRect(screenX + 5, obsY + obs.height - 10, obs.width - 10, 5);
                    
                    // Symbole danger
                    ctx.fillStyle = '#FFD700';
                    ctx.font = 'bold 20px Arial';
                    ctx.fillText('⚠', screenX + 15, obsY + 25);
                }
            });
        }
        
        // Dessiner la ligne d'arrivée
        function drawFinishLine() {
            const finishX = finishLine - roadOffset;
            
            if (finishX > -50 && finishX < canvas.width) {
                // Damier noir et blanc
                for (let i = 0; i < canvas.height; i += 40) {
                    for (let j = 0; j < 2; j++) {
                        ctx.fillStyle = (i / 40 + j) % 2 === 0 ? 'black' : 'white';
                        ctx.fillRect(finishX + j * 25, i, 25, 40);
                    }
                }
                
                // Texte
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 24px Arial';
                ctx.fillText('ARRIVÉE', finishX - 30, canvas.height / 2);
            }
        }
        
        // Vérifier les collisions
        function checkCollision() {
            const carY = carLane * laneHeight + laneHeight / 2 - carHeight / 2;
            
            for (let obs of obstacles) {
                const screenX = obs.x - roadOffset;
                const obsY = obs.lane * laneHeight + laneHeight / 2 - obs.height / 2;
                
                if (obs.lane === carLane &&
                    carX < screenX + obs.width &&
                    carX + carWidth > screenX &&
                    carY < obsY + obs.height &&
                    carY + carHeight > obsY) {
                    return true;
                }
            }
            return false;
        }
        
        // Augmenter la vitesse progressivement
        function updateSpeed() {
            speed = 2 + Math.floor(distance / 500) * 0.5;
            document.getElementById('speed').textContent = (speed / 2).toFixed(1);
        }
        
        // Boucle de jeu
        function gameLoop() {
            if (!gameRunning) return;
            
            // Effacer le canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Dessiner
            drawRoad();
            drawFinishLine();
            drawObstacles();
            drawCar();
            
            // Mettre à jour la position
            roadOffset += speed;
            distance = Math.floor(roadOffset);
            document.getElementById('distance').textContent = distance;
            
            // Augmenter la vitesse
            updateSpeed();
            
            // Vérifier la victoire
            if (roadOffset >= finishLine) {
                gameRunning = false;
                document.getElementById('victory').style.display = 'block';
                document.getElementById('restartBtn').style.display = 'inline-block';
                document.getElementById('upBtn').disabled = true;
                document.getElementById('downBtn').disabled = true;
                return;
            }
            
            // Vérifier les collisions
            if (checkCollision()) {
                gameRunning = false;
                document.getElementById('gameOver').style.display = 'block';
                document.getElementById('restartBtn').style.display = 'inline-block';
                document.getElementById('upBtn').disabled = true;
                document.getElementById('downBtn').disabled = true;
                return;
            }
            
            requestAnimationFrame(gameLoop);
        }
        
        // Contrôles
        document.getElementById('upBtn').addEventListener('click', () => {
            if (gameRunning) carLane = 0;
        });
        
        document.getElementById('downBtn').addEventListener('click', () => {
            if (gameRunning) carLane = 1;
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            gameRunning = true;
            carLane = 1;
            roadOffset = 0;
            speed = 2;
            distance = 0;
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('victory').style.display = 'none';
            document.getElementById('restartBtn').style.display = 'none';
            document.getElementById('upBtn').disabled = false;
            document.getElementById('downBtn').disabled = false;
            initObstacles();
            gameLoop();
        });
        
        // Contrôles clavier (bonus)
        document.addEventListener('keydown', (e) => {
            if (!gameRunning) return;
            if (e.key === 'ArrowUp' || e.key === 'z' || e.key === 'Z') {
                carLane = 0;
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                carLane = 1;
            }
        });
        
        // Démarrer le jeu
        gameLoop();
    