var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

let igraStatus = "menu";
let frames = 0;

canvas.width = 800;
canvas.height = 600;

function resizeGame() {
    let w_base = 800;
    let h_base = 600;
    
    let w_win = window.innerWidth;
    let h_win = window.innerHeight;
    
    let koef = Math.min(w_win / w_base, h_win / h_base);
    
    let f_width = Math.floor((w_base * koef) / 2) * 2;
    let f_height = Math.floor((h_base * koef) / 2) * 2;
    
    canvas.style.width = f_width + "px";
    canvas.style.height = f_height + "px";
    
    let scanLine = document.getElementById("scan");
    if (scanLine) {
        scanLine.style.width = f_width + "px";
        scanLine.style.height = f_height + "px";
    }
    
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    
    draw();
}

window.addEventListener("resize", resizeGame);
window.addEventListener("load", resizeGame);

let padW = 80;
let padH = 12;
let ballR = 6;
let stadH = 120;

let COLOR = {
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

let crowd = ["#e23838", "#3858d8", "#fae850", "#2d7a3e", "#a040b8", "#ffffff"];

let igrok = {
    x: canvas.width / 2 - padW / 2,
    y: canvas.height - 60, 
    w: padW,
    h: padH,
    score: 0,
    speed: 6,
    dir: 1 
};

let bot = {
    x: canvas.width / 2 - padW / 2,
    y: stadH + 60, 
    w: padW,
    h: padH,
    score: 0,
    speed: 3.5, 
    dir: 1
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: ballR,
    vx: 3,
    vy: 4
};

let knopki = {
    ArrowLeft: false,
    ArrowRight: false,
    KeyA: false,
    KeyD: false
};

window.addEventListener("keydown", function(e) {
    if (e.code in knopki) knopki[e.code] = true;
});

window.addEventListener("keyup", function(e) {
    if (e.code in knopki) knopki[e.code] = false;
});

window.addEventListener("mousedown", function() {
    if (igraStatus === "menu") {
        igraStatus = "playing";
        resetBall();
    }
});

window.addEventListener("touchstart", function(e) {
    if (igraStatus === "menu") {
        e.preventDefault();
        igraStatus = "playing";
        resetBall();
    }
}, { passive: false });

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = (canvas.height + stadH) / 2;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + 2);
    ball.vy = Math.random() > 0.5 ? 4 : -4;
}

function drawPlayerCharacter(c, isBot) {
    let cx = c.x + c.w / 2;
    let cy = c.y;
    
    let w = 24; 
    let h = 38; 
    let hd = 12; 

    let mainColor = isBot ? COLOR.cpu : COLOR.player;
    let darkColor = isBot ? COLOR.cpuDark : COLOR.playerDark;

    ctx.fillStyle = COLOR.shadow;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, w * 0.6, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(cx - w / 2), Math.round(cy - h * 0.3), w, Math.round(h * 0.2));

    ctx.fillStyle = COLOR.skin;
    ctx.fillRect(Math.round(cx - w / 2), Math.round(cy - h * 0.1), Math.floor(w * 0.3), Math.round(h * 0.1));
    ctx.fillRect(Math.round(cx + w / 2 - Math.floor(w * 0.3)), Math.round(cy - h * 0.1), Math.floor(w * 0.3), Math.round(h * 0.1));

    ctx.fillStyle = mainColor;
    ctx.fillRect(Math.round(cx - w / 2), Math.round(cy - h * 0.75), w, Math.round(h * 0.45));

    ctx.fillStyle = darkColor;
    ctx.fillRect(Math.round(cx - w / 2), Math.round(cy - h * 0.5), w, 3);

    ctx.fillStyle = COLOR.skin;
    ctx.fillRect(Math.round(cx - hd / 2), Math.round(cy - h - hd * 0.2), hd, hd);

    ctx.fillStyle = darkColor;
    ctx.fillRect(Math.round(cx - hd / 2), Math.round(cy - h - hd * 0.2), hd, 3);

    let storona = c.dir;
    let shoulderY = Math.round(cy - h * 0.6);
    let wristX = cx + storona * Math.round(w * 0.75);
    
    ctx.fillStyle = COLOR.skin;
    ctx.fillRect(Math.round((cx + storona * (w * 0.2) + wristX) / 2), shoulderY, 6, 3);
    ctx.fillRect(wristX, shoulderY, 4, 4);

    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(wristX + storona * 3, shoulderY, 4, 3);

    let rx = wristX + storona * 12;
    let ry = shoulderY;
    ctx.fillStyle = COLOR.racketFrame;
    ctx.fillRect(rx - 4, ry - 8, 9, 2);
    ctx.fillRect(rx - 4, ry + 8, 9, 2);
    ctx.fillRect(rx - 8, ry - 4, 2, 9);
    ctx.fillRect(rx + 8, ry - 4, 2, 9);
    
    ctx.fillStyle = COLOR.racketNet;
    ctx.fillRect(rx - 6, ry - 6, 13, 13);
}

function update() {
    if (igraStatus !== "playing") return;

    if (knopki.ArrowLeft || knopki.KeyA) {
        igrok.x -= igrok.speed;
        igrok.dir = -1;
    }
    if (knopki.ArrowRight || knopki.KeyD) {
        igrok.x += igrok.speed;
        igrok.dir = 1;
    }

    if (igrok.x < 60) igrok.x = 60;
    if (igrok.x + igrok.w > canvas.width - 60) igrok.x = canvas.width - 60 - igrok.w;

    let botCenter = bot.x + bot.w / 2;
    let ballCenter = ball.x;
    
    if (ball.vy < 0 && ball.y < 360) {
        let pohlopka = (ball.vx * 4); 
        if (Math.abs(ballCenter - botCenter) > 15) {
            if (ballCenter + pohlopka > botCenter) {
                bot.x += bot.speed;
                bot.dir = 1;
            } else if (ballCenter + pohlopka < botCenter) {
                bot.x -= bot.speed;
                bot.dir = -1;
            }
        }
    } else {
        let courtCenter = canvas.width / 2;
        if (Math.abs(courtCenter - botCenter) > 10) {
            bot.x += (courtCenter > botCenter ? 1 : -1) * (bot.speed * 0.5);
        }
    }

    if (bot.x < 60) bot.x = 60;
    if (bot.x + bot.w > canvas.width - 60) bot.x = canvas.width - 60 - bot.w;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x - ball.r < 60 || ball.x + ball.r > canvas.width - 60) {
        ball.vx = -ball.vx;
    }

    if (ball.y - ball.r <= bot.y && ball.y + ball.r >= bot.y - 8 &&
        ball.x >= bot.x && ball.x <= bot.x + bot.w) {
        ball.vy = Math.abs(ball.vy);
        let tochkaUdar = ball.x - (bot.x + bot.w / 2);
        ball.vx = tochkaUdar * 0.08;
    }

    if (ball.y + ball.r >= igrok.y && ball.y - ball.r <= igrok.y + 8 &&
        ball.x >= igrok.x && ball.x <= igrok.x + igrok.w) {
        ball.vy = -Math.abs(ball.vy);
        let tochkaUdar = ball.x - (igrok.x + igrok.w / 2);
        ball.vx = tochkaUdar * 0.08;
    }

    if (ball.y - ball.r < stadH) {
        igrok.score++;
        resetBall();
    } else if (ball.y + ball.r > canvas.height) {
        bot.score++;
        resetBall();
    }
}

function drawStadium() {
    ctx.fillStyle = COLOR.sky;
    ctx.fillRect(0, 0, canvas.width, 35);

    let rowY = 35;
    let rowH = 15;
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = (i % 2 === 0) ? COLOR.stands : COLOR.standsDark;
        ctx.fillRect(0, rowY, canvas.width, rowH);

        ctx.fillStyle = COLOR.skin; 
        for (let x = 12; x < canvas.width; x += 20) {
            ctx.fillRect(x, rowY + 4, 6, 6);
            ctx.fillStyle = crowd[(x + i) % crowd.length];
            ctx.fillRect(x, rowY + 1, 6, 3);
            ctx.fillStyle = COLOR.skin; 
        }
        rowY += rowH;
    }

    ctx.fillStyle = "#111111";
    ctx.fillRect(0, stadH - 6, canvas.width, 6);

    ctx.fillStyle = COLOR.lamp;
    ctx.fillRect(15, 10, 25, 12);   
    ctx.fillRect(canvas.width - 40, 10, 25, 12); 
}

function drawCourt() {
    ctx.fillStyle = COLOR.courtA;
    ctx.fillRect(0, stadH, canvas.width, canvas.height - stadH);

    ctx.strokeStyle = COLOR.lines;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(60, stadH);
    ctx.lineTo(60, canvas.height);
    ctx.moveTo(canvas.width - 60, stadH);
    ctx.lineTo(canvas.width - 60, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60, 360);
    ctx.lineTo(canvas.width - 60, 360);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, stadH + 20);
    ctx.lineTo(canvas.width / 2, canvas.height - 20);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, stadH + 20);
    ctx.lineTo(canvas.width - 60, stadH + 20);
    ctx.moveTo(60, canvas.height - 20);
    ctx.lineTo(canvas.width - 60, canvas.height - 20);
    ctx.stroke();
}

function drawMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "40px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillStyle = COLOR.playerDark;
    ctx.fillText("ТЕНІС", canvas.width / 2 + 4, 254);

    ctx.fillStyle = COLOR.accent;
    ctx.fillText("ТЕНІС", canvas.width / 2, 250);

    let blink = Math.floor(frames / 24) % 2 === 0;
    if (blink) {
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

    if (igraStatus === "menu") {
        drawMenu();
    } else {
        ctx.fillStyle = "#ffffff";
        ctx.font = "24px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText(bot.score, canvas.width / 2, 260);
        ctx.fillText(igrok.score, canvas.width / 2, 480);

        drawPlayerCharacter(igrok, false); 
        drawPlayerCharacter(bot, true);    

        ctx.fillStyle = COLOR.ballEdge;
        ctx.fillRect(ball.x - ball.r, ball.y - ball.r, ball.r * 2, ball.r * 2);
        ctx.fillStyle = COLOR.ball;
        ctx.fillRect(ball.x - ball.r + 1.5, ball.y - ball.r + 1.5, (ball.r * 2) - 3, (ball.r * 2) - 3);
    }
ctx.save();
ctx.globalAlpha = 0.08;
for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, y + 2, canvas.width, 1);
}
ctx.restore();
}

function gameLoop() {
    frames++;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
