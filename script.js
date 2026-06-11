const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const STATE = {
    MENU: "menu",
    PLAYING: "playing"
};
let gameState = STATE.MENU;
let frameCount = 0;


const paddleWidth = 80;
const paddleHeight = 12;
const ballRadius = 6;
const stadiumHeight = 120;

const COLORS = {
    player: "#e23838",
    playerDark: "#8a1010",
    cpu: "#3858d8",
    cpuDark: "#1a2a8a",
    skin: "#f4c890",
    shadow: "rgba(0, 0, 0, 0.35)",
    racketFrame: "#111",
    racketNet: "#dcdcdc",
    ball: "#fae850",
    ballEdge: "#c9a418",
    courtA: "#c47a3d", 
    lines: "#f5f5f5",
    sky: "#101626",
    stands: "#282e3d",
    standsDark: "#1a1e29",
    lamp: "#ffffff",
    accent: "#f0a020"
};

const crowdColors = ["#e23838", "#3858d8", "#fae850", "#2d7a3e", "#a040b8", "#ffffff"];

const player = {
    x: canvas.width / 2 - paddleWidth / 2,
    y: canvas.height - 60, 
    width: paddleWidth,
    height: paddleHeight,
    score: 0,
    speed: 6,
    facing: 1 
};

const bot = {
    x: canvas.width / 2 - paddleWidth / 2,
    y: stadiumHeight + 60, 
    width: paddleWidth,
    height: paddleHeight,
    score: 0,
    speed: 3.5, 
    facing: 1
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    vx: 3,
    vy: 4
};

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    KeyA: false,
    KeyD: false
};

window.addEventListener("keydown", (e) => {
    if (e.code in keys) keys[e.code] = true;
});

window.addEventListener("keyup", (e) => {
    if (e.code in keys) keys[e.code] = false;
});

window.addEventListener("mousedown", () => {
    if (gameState === STATE.MENU) {
        gameState = STATE.PLAYING;
        resetBall();
    }
});

window.addEventListener("touchstart", (e) => {
    if (gameState === STATE.MENU) {
        e.preventDefault();
        gameState = STATE.PLAYING;
        resetBall();
    }
}, { passive: false });

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = (canvas.height + stadiumHeight) / 2;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + 2);
    ball.vy = Math.random() > 0.5 ? 4 : -4;
}

function drawPlayerCharacter(char, isBot) {
    const cx = char.x + char.width / 2;
    const cy = char.y;
    
    const w = 24; 
    const h = 38; 
    const hd = 12; 

    const mainColor = isBot ? COLORS.cpu : COLORS.player;
    const darkColor = isBot ? COLORS.cpuDark : COLORS.playerDark;

    ctx.fillStyle = COLORS.shadow;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, w * 0.6, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(cx - w / 2), Math.round(cy - h * 0.3), w, Math.round(h * 0.2));

    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(Math.round(cx - w / 2), Math.round(cy - h * 0.1), Math.floor(w * 0.3), Math.round(h * 0.1));
    ctx.fillRect(Math.round(cx + w / 2 - Math.floor(w * 0.3)), Math.round(cy - h * 0.1), Math.floor(w * 0.3), Math.round(h * 0.1));

    ctx.fillStyle = mainColor;
    ctx.fillRect(Math.round(cx - w / 2), Math.round(cy - h * 0.75), w, Math.round(h * 0.45));

    ctx.fillStyle = darkColor;
    ctx.fillRect(Math.round(cx - w / 2), Math.round(cy - h * 0.5), w, 3);

    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(Math.round(cx - hd / 2), Math.round(cy - h - hd * 0.2), hd, hd);

    ctx.fillStyle = darkColor;
    ctx.fillRect(Math.round(cx - hd / 2), Math.round(cy - h - hd * 0.2), hd, 3);

    const dir = char.facing;
    const shoulderY = Math.round(cy - h * 0.6);
    const wristX = cx + dir * Math.round(w * 0.75);
    
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(Math.round((cx + dir * (w * 0.2) + wristX) / 2), shoulderY, 6, 3);
    ctx.fillRect(wristX, shoulderY, 4, 4);

    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(wristX + dir * 3, shoulderY, 4, 3);

    const rx = wristX + dir * 12;
    const ry = shoulderY;
    ctx.fillStyle = COLORS.racketFrame;
    ctx.fillRect(rx - 4, ry - 8, 9, 2);
    ctx.fillRect(rx - 4, ry + 8, 9, 2);
    ctx.fillRect(rx - 8, ry - 4, 2, 9);
    ctx.fillRect(rx + 8, ry - 4, 2, 9);
    
    ctx.fillStyle = COLORS.racketNet;
    ctx.fillRect(rx - 6, ry - 6, 13, 13);
}

function update() {
    if (gameState !== STATE.PLAYING) return;

    if (keys.ArrowLeft || keys.KeyA) {
        player.x -= player.speed;
        player.facing = -1;
    }
    if (keys.ArrowRight || keys.KeyD) {
        player.x += player.speed;
        player.facing = 1;
    }

    if (player.x < 60) player.x = 60;
    if (player.x + player.width > canvas.width - 60) player.x = canvas.width - 60 - player.width;

    let botCenter = bot.x + bot.width / 2;
    let ballCenter = ball.x;
    
    if (ball.vy < 0 && ball.y < 360) {
        let errorMargin = (ball.vx * 4); 
        if (Math.abs(ballCenter - botCenter) > 15) {
            if (ballCenter + errorMargin > botCenter) {
                bot.x += bot.speed;
                bot.facing = 1;
            } else if (ballCenter + errorMargin < botCenter) {
                bot.x -= bot.speed;
                bot.facing = -1;
            }
        }
    } else {
        let courtCenter = canvas.width / 2;
        if (Math.abs(courtCenter - botCenter) > 10) {
            bot.x += (courtCenter > botCenter ? 1 : -1) * (bot.speed * 0.5);
        }
    }

    if (bot.x < 60) bot.x = 60;
    if (bot.x + bot.width > canvas.width - 60) bot.x = canvas.width - 60 - bot.width;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x - ball.radius < 60 || ball.x + ball.radius > canvas.width - 60) {
        ball.vx = -ball.vx;
    }

    if (ball.y - ball.radius <= bot.y && ball.y + ball.radius >= bot.y - 8 &&
        ball.x >= bot.x && ball.x <= bot.x + bot.width) {
        ball.vy = Math.abs(ball.vy);
        let hitPoint = ball.x - (bot.x + bot.width / 2);
        ball.vx = hitPoint * 0.08;
    }

    if (ball.y + ball.radius >= player.y && ball.y - ball.radius <= player.y + 8 &&
        ball.x >= player.x && ball.x <= player.x + player.width) {
        ball.vy = -Math.abs(ball.vy);
        let hitPoint = ball.x - (player.x + player.width / 2);
        ball.vx = hitPoint * 0.08;
    }

    if (ball.y - ball.radius < stadiumHeight) {
        player.score++;
        resetBall();
    } else if (ball.y + ball.radius > canvas.height) {
        bot.score++;
        resetBall();
    }
}

function drawStadium() {
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, canvas.width, 35);

    let rowY = 35;
    let rowHeight = 15;
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = (i % 2 === 0) ? COLORS.stands : COLORS.standsDark;
        ctx.fillRect(0, rowY, canvas.width, rowHeight);

        ctx.fillStyle = COLORS.skin; 
        for (let x = 12; x < canvas.width; x += 20) {
            ctx.fillRect(x, rowY + 4, 6, 6);
            ctx.fillStyle = crowdColors[(x + i) % crowdColors.length];
            ctx.fillRect(x, rowY + 1, 6, 3);
            ctx.fillStyle = COLORS.skin; 
        }
        rowY += rowHeight;
    }

    ctx.fillStyle = "#111";
    ctx.fillRect(0, stadiumHeight - 6, canvas.width, 6);

    ctx.fillStyle = COLORS.lamp;
    ctx.fillRect(15, 10, 25, 12);   
    ctx.fillRect(canvas.width - 40, 10, 25, 12); 
}

function drawCourt() {
    ctx.fillStyle = COLORS.courtA;
    ctx.fillRect(0, stadiumHeight, canvas.width, canvas.height - stadiumHeight);

    ctx.strokeStyle = COLORS.lines;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(60, stadiumHeight);
    ctx.lineTo(60, canvas.height);
    ctx.moveTo(canvas.width - 60, stadiumHeight);
    ctx.lineTo(canvas.width - 60, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60, 360);
    ctx.lineTo(canvas.width - 60, 360);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, stadiumHeight + 20);
    ctx.lineTo(canvas.width / 2, canvas.height - 20);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, stadiumHeight + 20);
    ctx.lineTo(canvas.width - 60, stadiumHeight + 20);
    ctx.moveTo(60, canvas.height - 20);
    ctx.lineTo(canvas.width - 60, canvas.height - 20);
    ctx.stroke();
}

function drawMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "40px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.playerDark;
    ctx.fillText("ТЕНІС", canvas.width / 2 + 4, 254);

    ctx.fillStyle = COLORS.accent;
    ctx.fillText("ТЕНІС", canvas.width / 2, 250);

    let isBlinking = Math.floor(frameCount / 24) % 2 === 0;
    if (isBlinking) {
        ctx.font = "18px 'Press Start 2P'";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("НАТИСНИ ЩОБ ПОЧАТИ ГРУ", canvas.width / 2, 400);
    }
    
    ctx.font = "10px 'Press Start 2P'";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText("ВИКОРИСТОВУЙТЕ СТРІЛКИ АБО КНОПКИ A/D ДЛЯ РУХУ", canvas.width / 2, 540);
}

function draw() {
    drawCourt();   
    drawStadium(); 

    if (gameState === STATE.MENU) {
        drawMenu();
    } else {
        ctx.fillStyle = "#ffffff";
        ctx.font = "24px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText(bot.score, canvas.width / 2, 260);
        ctx.fillText(player.score, canvas.width / 2, 480);

        drawPlayerCharacter(player, false); 
        drawPlayerCharacter(bot, true);    

        ctx.fillStyle = COLORS.ballEdge;
        ctx.fillRect(ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
        ctx.fillStyle = COLORS.ball;
        ctx.fillRect(ball.x - ball.radius + 1.5, ball.y - ball.radius + 1.5, (ball.radius * 2) - 3, (ball.radius * 2) - 3);
    }
}

function gameLoop() {
    frameCount++;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
