(   function () {
//-------------------------------//Recursos do jogo\\-------------------------------//

    //-------------//Sons\\-------------\\
    //Som de fundo
    var bgmfundo = new Audio('audio/bgm.mp3');
    //Som emitido ao pular
    var somPulo = new Audio('audio/jump.ogg');
    //Som emitido ao atacar
    var somAtaque = new Audio('audio/ataque.ogg');
    //Som emitido ao cair
    var somFall = new Audio('audio/fall.ogg');
    //Som emitido ao teleportar
    var somTele = new Audio('audio/teleporte.ogg');

    //-------------//Imagens\\-------------\\
    //Imagem da tela de título do jogo
    var title = new Image();
    title.src = "img/title.png";
    title.addEventListener("load",function(){requestAnimationFrame(loop,cnv);},false);
    //Imagem do background(cenário)
    var back = new Image();
    back.src = "img/back.png";
    back.addEventListener("load",function(){requestAnimationFrame(loop,cnv);},false);
    //Imagem das plataformas
    var chao = new Image();
    chao.src = "img/plata.png";
    chao.addEventListener("load",function(){requestAnimationFrame(loop,cnv);},false);
    //Imagem do pesonagem principal
    var alizel_img = new Image();
    alizel_img.src = "img/alizel.png";
    alizel_img.addEventListener("load",function(){requestAnimationFrame(loop,cnv);},false);
    //Imagem do inimigo "Zumbi"
    var izumbi = new Image();
    izumbi.src = "img/zumbi.png";
    izumbi.addEventListener("load",function(){requestAnimationFrame(loop,cnv);},false);
    //Imagem portal
    var portal = new Image();
    portal.src = "img/portal.png";
    portal.addEventListener("load",function(){requestAnimationFrame(loop,cnv);},false);
    //Imagem Game over
    var gameoverimg = new Image();
    gameoverimg.src = "img/gamover.png";
    gameoverimg.addEventListener("load",function(){requestAnimationFrame(loop,cnv);},false);
    //Imagem Fim
    var imgFim = new Image();
    imgFim.src = "img/venceu.png";
    imgFim.addEventListener("load",function(){requestAnimationFrame(loop,cnv);},false);

//-------------------------------//CANVAS\\-------------------------------//
    var cnv = document.querySelector("canvas");
    var ctx = cnv.getContext("2d");
    var WIDTH = cnv.width, HEIGHT = cnv.height;

//-------------------------------//Declaração de Váriaveis\\-------------------------------//
    //Atribuição de número de tecla pressionada para texto
    var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40, Z = 90, SHIFT = 16;
    var mvLeft = mvUp = mvRight = mvDown = punch = correr = pular = false ;
    var maxPulos = 1, velocidade = 6, dire=2, jogando=0;


//-------------------------------//Declaração de Eventos\\-------------------------------//
    window.addEventListener("keydown",keydownHandler,false);
    window.addEventListener("keyup",keyupHandler,false);
    document.addEventListener("keydown", clique);
    document.addEventListener("mousedown", clica);

//-------------------------------//Objetos\\-------------------------------//
    //Objeto referente aos estados do jogo
    var estados = {
        jogar: 0,
        jogando: 1,
        perdeu: 2,
        fim: 3
    };
    var estadoAtual = estados.jogar;

    //Objeto referente à tela de título do game.
    var titlescreen = {
        img: title,
        x: 0,
        y: 0,
        width: 600,
        height: 600,

        desenha:function () {
            ctx.drawImage(title,this.x,this.y,this.width,this.height);
        }
    };
    var gameover = {
        img: gameoverimg,
        x: 0,
        y: 0,
        width: 600,
        height: 600,

        desenha:function () {
            ctx.drawImage(gameoverimg,this.x,this.y,this.width,this.height);
        }
    };
    var venceu = {
        img: imgFim,
        x: 0,
        y: 0,
        width: 600,
        height: 600,

        desenha:function () {
            ctx.drawImage(imgFim,this.x,this.y,this.width,this.height);
        }
    };

    //Objeto referente ao cenário do Jogo
    var gameWorld = {
        img: back,
        x: 0,
        y: 0,
        width: 10000,
        height: 800,

        desenha:function () {
            ctx.drawImage(back,this.x,this.y,this.width,this.height);
        }
    };

    //Objeto referente ao inimigo zumbi
    var zumbi = {
        x: 414,
        y: 453,
        width: 66,
        height: 87,
        speed: 0,
        srcX: 8,
        srcY: 11,
        countAnim: 0,
        gravidade: 0.02,
        dir:-1,

        atualiza:function ()
        {
            this.speed -= this.gravidade;
            this.y += this.speed;
            if(this.y > 538 - this.height)
            {
                this.y = 538 - 85;
                this.speed = 1;
            }
            this.countAnim++;

            if(this.countAnim >= 50){
                this.countAnim = 0;
            }

            this.srcX = Math.floor(this.countAnim/20) * 83 ;

            if(this.x <= 0 && this.dir == -1){
                zumbi.srcY = 120;
                this.dir = 1;
            }

            else if(this.x >= 750 && this.dir == 1){
                zumbi.srcY = 8;
                this.dir = -1;
            }
            this.x += this.speed * this.dir;
            if(player.x + player.width > zumbi.x && player.x < zumbi.x + zumbi.width && player.y +
                player.height > zumbi.y){
                estados = estados.perdeu;
            }
        },

        desenha:function () {
            ctx.drawImage(izumbi, this.srcX,this.srcY,this.width,this.height, this.x,this.y,this.width,this.height);
        }
    };



    //Objeto referente ao personagem
    var player = {
        x: 0,
        y: 0,
        width: 66,
        height: 75,
        speed: 0.1,
        //atributos de animação
        srcX: 8,
        srcY: 1,
        countAnim: 0,
        gravidade: 0.2,
        forcaDoPulo: 17.6,
        qtdPulos: 0,
        vidas : 3,
        colidindo: false,

        perder:function () {
            this.x=0;
            this.y=0;
            this.vidas=3;
            somFall.pause();
            bgmfundo.pause();
        },

        desenha:function () {
            ctx.drawImage(alizel_img, this.srcX,this.srcY,this.width,this.height, this.x,this.y,this.width,this.height);
        },

        pula:function ()
        {
            if(this.qtdPulos < maxPulos) {
                this.speed = - 10;
                this.qtdPulos++;
            }
        },
        atualiza:function ()
        {
            this.speed += this.gravidade;
            this.y += this.speed;

            //Zonas de queda
            //1ªplataforma vão
            if(this.x >= 800 && this.x < 953){
                plataforma.y = 1300;
                if(player.y >= 500){
                    bgmfundo.pause();
                    somFall.play();
                    this.speed = 0.6;
                    mvRight = false;
                    mvLeft = false;
                    if(player.y >= 900){
                        if(this.vidas >= 1){
                            player.vidas--;
                            this.reseta();
                        }
                        else{
                            estadoAtual = estados.perdeu;
                            this.perder();
                        }
                    }
                }
            }
            //2ªplataforma vão
            if(this.x >= 2580 && this.x < 2710){
                plataforma.y = 1300;
                if(player.y >= 500){
                    bgmfundo.pause();
                    somFall.play();
                    this.speed = 0.6;
                    mvRight = false;
                    mvLeft = false;
                    if(player.y >= 900){
                        if(this.vidas >= 1){
                            player.vidas--;
                            this.reseta();
                        }
                        else{
                            estadoAtual = estados.perdeu;
                            this.perder();
                        }
                    }
                }
            }
            //3º vão plataforma
            if(this.x >= 3530 && this.x < 3713){
                plataforma.y = 1300;
                if(player.y >= 500){
                    bgmfundo.pause();
                    somFall.play();
                    this.speed = 0.6;
                    mvRight = false;
                    mvLeft = false;
                    if(player.y >= 900){
                        if(this.vidas >= 1){
                            player.vidas--;
                            this.reseta();
                        }
                        else{
                            estadoAtual = estados.perdeu;
                            this.perder();
                        }
                    }
                }
            }
            //4º vão plataforma
            if(this.x >= 5355 && this.x < 5546){
                plataforma.y = 1300;
                if(player.y >= 500){
                    bgmfundo.pause();
                    somFall.play();
                    this.speed = 0.6;
                    mvRight = false;
                    mvLeft = false;
                    if(player.y >= 900){
                        if(this.vidas >= 1){
                            player.vidas--;
                            this.reseta();
                        }
                        else{
                            estadoAtual = estados.perdeu;
                            this.perder();
                        }
                    }
                }
            }
            //5º vão plataforma
            if(this.x >= 6363 && this.x < 6571){
                plataforma.y = 1300;
                if(player.y >= 500){
                    bgmfundo.pause();
                    somFall.play();
                    this.speed = 0.6;
                    mvRight = false;
                    mvLeft = false;
                    if(player.y >= 900){
                        if(this.vidas >= 1){
                            player.vidas--;
                            this.reseta();
                        }
                        else{
                            estadoAtual = estados.perdeu;
                            this.perder();
                        }
                    }
                }
            }
            //6º vão plataforma
            if(this.x >= 7380 && this.x < 7745){
                plataforma.y = 1300;
                if(player.y >= 500){
                    bgmfundo.pause();
                    somFall.play();
                    this.speed = 0.6;
                    mvRight = false;
                    mvLeft = false;
                    if(player.y >= 900){
                        if(this.vidas >= 1){
                            player.vidas--;
                            this.reseta();
                        }
                        else{
                            estadoAtual = estados.perdeu;
                            this.perder();
                        }
                    }
                }
            }
            //7º vão plataforma
            if(this.x >= 8555 && this.x < 8672){
                plataforma.y = 1300;
                if(player.y >= 500){
                    bgmfundo.pause();
                    somFall.play();
                    this.speed = 0.6;
                    mvRight = false;
                    mvLeft = false;
                    if(player.y >= 900){
                        if(this.vidas >= 1){
                            player.vidas--;
                            this.reseta();
                        }
                        else{
                            estadoAtual = estados.perdeu;
                            this.perder();
                        }
                    }
                }
            }
            //Zonas de plataformas
            //1ªplataforma
            if(this.x > 20 && this.x < 780){
                plataforma.x = -20;
                plataforma.y = 538;
            }
            //2ªplataforma
            if(this.x >= 952 && this.x <= 2570){
                plataforma.x = 952;
                plataforma.y = 598;
            }
            //3ªplataforma
            if(this.x >= 2722 && this.x < 3500){
                plataforma.x = 2722;
                plataforma.y = 508;
            }
            //4ªplataforma
            if(this.x >=3712 && this.x < 5350){
                plataforma.x = 3712;
                plataforma.y = 478;

            }
            //5ªplataforma
            if(this.x >=5532 && this.x < 6355){
                plataforma.x = 5532;
                plataforma.y = 578;
            }
            //6ªPlataforma
            if(this.x >=6552 && this.x < 7370){
                plataforma.x = 6552;
                plataforma.y = 488;
            }
            //7ªPlataforma
            if(this.x >=7732 && this.x < 8545){
                plataforma.x = 7732;
                plataforma.y = 268;
            }
            //8ªPlataforma
            if(this.x >=8662 && this.x < 10000){
                plataforma.x = 8662;
                plataforma.y = 598;
            }

            if(this.y > plataforma.y - this.height)
            {
                this.y = plataforma.y - 71;
                this.qtdPulos = 0;
                this.speed =0.9;
            }

            //Teste do portal
            if(this.x >= 7282 && this.x <=7403 && punch===true){
                somTele.play();
                this.x = 7733;
            }
            //Teste Fim
            if(this.x >= 9174 && this.x <=9295 && punch===true){
                somTele.play();
                estadoAtual = estados.fim;
            }

        },
        reseta : function () {
            this.speed = 0;
            this.x = 100;
        }

    };

    //Objeto referente as plataformas do jogo
    var plataforma = {
        x : -20,
        y : 538,
        altura : 156,
        largura : 847,
        img : plataforma,

        desenha:function ()
        {
            ctx.drawImage(chao,-20,538,this.largura,this.altura);
            ctx.drawImage(chao,952,596,this.largura,this.altura);
            ctx.drawImage(chao,1772,596,this.largura,this.altura);
            ctx.drawImage(chao,2722,508,this.largura,this.altura);
            ctx.drawImage(chao,3712,478,this.largura,this.altura);
            ctx.drawImage(chao,4532,478,this.largura,this.altura);
            ctx.drawImage(chao,5532,578,this.largura,this.altura);
            ctx.drawImage(chao,6552,488,this.largura,this.altura);
            ctx.drawImage(chao,7732,268,this.largura,this.altura);
            ctx.drawImage(chao,8662,598,this.largura,this.altura);
            ctx.drawImage(chao,9482,598,this.largura,this.altura);
        }
    };

    //Objeto referente à camera do jogo
    var cam = {
        x: 0,
        y: 0,
        width: WIDTH,
        height: HEIGHT,

        leftEdge: function(){
            return this.x + (this.width * 0.25);
        },
        rightEdge: function(){
            return this.x + (this.width * 0.75);
        },
        topEdge: function(){
            return this.y + (this.height * 0.25);
        },
        bottomEdge: function(){
            return this.y + (this.height * 0.75);
        }
    };
    //Centralizar a camera
    cam.x = (gameWorld.width - cam.width)/2;
    cam.y = (gameWorld.height - cam.height)/2;


    //Função ao clicar na tela
    function clica(evento) {
            if (estadoAtual === estados.jogar) {
                estadoAtual = estados.jogando;
                jogando=1;
            }

            else if (estadoAtual === estados.perdeu) {
                estadoAtual = estados.jogar;
                jogando = 0;
                player.reseta();
            }
            else if (estadoAtual === estados.fim) {
                estadoAtual = estados.jogar;
                jogando = 0;
                player.reseta();
            }

    }

    //Função quando pressionar a tecla seta para cima
    function clique(evento) {
        var key = evento.keyCode;
        switch (key) {
            case UP:
                pular = true;
                break;
        }
    }

    //Switch Case para quando o usuário pressionar e segurar determinada tecla
    function keydownHandler(e){
        var key = e.keyCode;
        switch(key)
        {
            case LEFT:
                mvLeft = true;
                pular = false;
                punch=false;
                break;
            case RIGHT:
                mvRight = true;
                punch = false;
                pular = false;
                break;
            case DOWN:
                mvDown = true;
                punch=false;
                break;
            case Z:
                punch = true;
                mvLeft = false;
                mvRight = false;
                mvDown = false;
                break;
            case SHIFT:
                correr = true;
                break;
        }
    }

    //Switch Case para quando o usuário deixar de pressionar determinada tecla
    function keyupHandler(e){
        var key = e.keyCode;
        switch(key)
        {
            case LEFT:
                mvLeft = false;
                break;
            case RIGHT:
                mvRight = false;
                break;
            case DOWN:
                mvDown = false;
                break;
            case Z:
                punch = false;
                break;
            case SHIFT:
                correr = false;
                break;
        }
    }

//-------------------------------//Função de atualizar o jogo\\-------------------------------//
    function update()
    {
        if(estadoAtual == estados.jogando) {
//-------------------------------//update- Movimentação\\-------------------------------//
            //Testando se o personagem estiver pulando
            if (pular === true) {
                somPulo.play();
                mvLeft = false;
                mvRight = false;
                player.srcY = 161;
                player.pula();
                pular = false;
            }
            //Testando se o personagem estiver se movendo para esquerda
            if (mvLeft && !mvRight) {
                player.x -= player.speed;
                //Mudar a posição no seu spritesheet
                player.srcY = 81;
                dire = 1;
            }
            //Testando se o personagem estiver se movendo para direita
            if (mvRight && !mvLeft) {
                player.x += player.speed;
                //ajuste de orientação da animação para direita
                player.srcY = 1;
                dire = 2;
            }
            //Testando se o personagem estiver se movendo para para baixo
            if (mvDown && !mvUp) {
                player.y += player.speed;
                //ajuste de orientação da animação para baixo
                player.srcX += 1;
            }
            //Testando se o personagem estiver ativado o ataque
            if (punch === true) {
                somAtaque.play();
                if (dire === 2) {
                    player.srcY = 161;
                }
                else
                    player.srcY = 241;
            }
            else {
                if (dire === 2) {
                    player.srcY = 1;
                }
                else
                    player.srcY = 81;
            }

//-------------------------------//update - Animação\\-------------------------------//
            //processo de animação
            if (mvLeft || mvRight || mvUp || mvDown || punch || pular) {
                player.countAnim++;

                if (player.countAnim >= 100) {
                    player.countAnim = 0;
                }

                player.srcX = Math.floor(player.countAnim / 20) * 68;
            } else {
                player.srcX = 0;
                player.countAnim = 0;
            }
//-------------------------------//update - Limites\\-------------------------------//
            //limite do zumbi
            if (zumbi.x < 0) {
                zumbi.dir = 1;
                zumbi.x = 0;
            }
            //Limite do jogador
            if (player.x < 0) {
                player.x = 0;
            }
            if (player.x >= 9950)
                player.x = 9948;

            if (player.y < 0) {
                player.y = 0;
            }


//-------------------------------//update - Posição camera\\-------------------------------//
            //atualizar a posição da câmera em função do char
            if (player.x < cam.leftEdge()) {
                cam.x = player.x - (cam.width * 0.25);

            }
            if (player.x + player.width > cam.rightEdge()) {
                cam.x = player.x + player.width - (cam.width * 0.75);
            }
            if (player.y < cam.topEdge()) {
                cam.y = player.y - (cam.height * 0.25);
            }
            if (player.y + player.height > cam.bottomEdge()) {
                cam.y = player.y + player.height - (cam.height * 0.75);
            }

            //Limite da câmera
            if (cam.x < 0) {
                cam.x = 0;
            }
            if (cam.x + cam.width > gameWorld.width) {
                cam.x = gameWorld.width - cam.width;
            }
            if (cam.y < 0) {
                cam.y = 0;
            }
            if (cam.y + cam.height > gameWorld.height) {
                cam.y = gameWorld.height - cam.height;
            }

//-------------------------------//update - Atualizar Objeto\\-------------------------------//
            player.atualiza();
            //zumbi.atualiza();
        }
    }

//-------------------------------//Função de desenhar\\-------------------------------//
    function render(){
        if(estadoAtual === estados.jogando){
            ctx.clearRect(0,0,WIDTH,HEIGHT);
            ctx.save();
            ctx.translate(-cam.x,-cam.y);
            gameWorld.desenha();
            plataforma.desenha();
            ctx.drawImage(portal,7282,413);
            ctx.fillStyle = "#3eff00";
            ctx.font = "12px Century Gothic";
            ctx.fillText(player.vidas, player.x +60, player.y);
            ctx.fillText("Alizel:", player.x+20, player.y);
            //zumbi.desenha();
            //desenha o personagem
            player.desenha();
            ctx.restore();
        }
        if (estadoAtual === estados.jogar){
            titlescreen.desenha();
        }
        if (estadoAtual === estados.perdeu){
            gameover.desenha();
        }
        if (estadoAtual === estados.fim){
            venceu.desenha();
        }


    }

//-------------------------------//Função de Rodar o jogo\\-------------------------------//
    function loop(){
        if(estadoAtual===estados.jogando){
            bgmfundo.play();
        }
        update();
        render();
        requestAnimationFrame(loop,cnv);
    }




}());