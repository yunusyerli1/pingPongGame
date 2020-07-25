(function () {
    // When refresh the page, we need to clear the local storage.
    if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
        localStorage.clear();
      }
    //To be able to copy and paste the code to other webpages, we need to clean their body
    document.body.innerHTML = '';
    let isGameStarted = false;
    let isGamePaused = false;
    const CSS = {
        arena: {
            width: 900,
            height: 600,
            background: '#62247B',
            position: 'fixed',
            top: '50%',
            left: '50%',
            zIndex: '999',
            transform: 'translate(-50%, -50%)'
        },
        ball: {
            width: 15,
            height: 15,
            position: 'absolute',
            top:  292.5,
            left:  443,
            borderRadius: 50,
            background: '#C6A62F'
        },
        line: {
            width: 0,
            height: 600,
            borderLeft: '2px dashed #C6A62F',
            position: 'absolute',
            top: 0,
            left: '50%'
        },
        stick: {
            width: 12,
            height: 85,
            position: 'absolute',
            background: '#C6A62F'
        },
        stick1: {
            left: 0,
            top: 257.5,
        },
        stick2: {
            right: 0,
            top: 257.5,
        },
        score:{
            font:'Arial',
            fontSize:100,
            color: 'white',
            position:'absolute',
            opacity: 0.3
        },
        score1:{
            top:0,
            left:350
            
        },
        score2:{
            top:0,
            left:500
        },
        buttonArea:{
            position:'absolute',
            backgroundColor:'gray',
            borderRadius:5,
            opacity:0.9,
            width:350,
            height:150,
            top:200,
            left:275
        },
        buttonStart:{
            position:'relative',
            border:2,
            borderRadius:5,
            cursor:"pointer",
            width:100,
            height:40,
            top:40,
            left:125,
            text:'Arial',
            fontSize:20
        },
        textMessage:{
            fontSize:17,
            padding:15,
            text:'Arial'
        },
        pausedText:{
            font:'Arial',
            fontSize:150,
            color: 'white',
            position:'absolute',
            top:75,
            left:250,
            opacity: 0.3
        }
    };

    let CONSTS = {
    	gameSpeed: 20,
        score1: 0,
        score2: 0,
        stick1Speed: 0,
        stick2Speed: 0,
        ballTopSpeed: 0,
        ballLeftSpeed: 0,
        textMessage: 'To start the game, please click START button.'
    };
    
    function start() {

        draw();
        $("#startButton").click(function() {
           //If there is setInterval before starting the game, we need to clear it. E.g. when it is 2nd round. 
            clearInterval(window.pongLoop);
            score(0,0);
            setEvents();
            isGameStarted = true;
            roll();
            loop();
            $("#startArea").hide();

        });    
    }
   
    function draw() {
        //Draw the arena and rest
        $('<div/>', {id: 'pong-game'}).css(CSS.arena).appendTo('body');
        $('<div/>', {id: 'pong-line'}).css(CSS.line).appendTo('#pong-game');
        $('<div/>', {id: 'pong-ball'}).css(CSS.ball).appendTo('#pong-game');
        $('<div/>', {id: 'stick-1'}).css($.extend(CSS.stick1, CSS.stick))
        .appendTo('#pong-game');
        $('<div/>', {id: 'stick-2'}).css($.extend(CSS.stick2, CSS.stick))
        .appendTo('#pong-game');
        $('<div/>', {id: 'score-1'}).css($.extend(CSS.score1, CSS.score))
        .appendTo('#pong-game');
        $('<div/>', {id: 'score-2'}).css($.extend(CSS.score2, CSS.score))
        .appendTo('#pong-game');

        $('<div/>', {id: 'startArea'}).css(CSS.buttonArea).appendTo('#pong-game');
        $('<p/>', {id: 'startText'}).text(CONSTS.textMessage).css(CSS.textMessage).appendTo('#startArea');
        $('<button/>', {id: 'startButton'}).text('START').css(CSS.buttonStart).appendTo('#startArea');
        
        $('<p/>', {id: 'pausedText'}).text("Paused").css(CSS.pausedText).appendTo('#pong-game');
        $("#pausedText").hide();
        
    }

    function setEvents() {
        //Key events
        $(document).on('keydown', function (e) {
            if (e.keyCode == 87) {
                CONSTS.stick1Speed = -5;
            }
        });

        $(document).on('keyup', function (e) {
            if (e.keyCode == 87) {
                CONSTS.stick1Speed = 0;
            }
        });
        $(document).on('keydown', function (e) {
            if (e.keyCode == 83) {
                CONSTS.stick1Speed = 5;
            }
        });
        $(document).on('keyup', function (e) {
            if (e.keyCode == 83) {
                CONSTS.stick1Speed = 0;
            }
        });
        $(document).on('keydown', function (e) {
            if (e.keyCode == 38) {
                CONSTS.stick2Speed = -5;
            }
        });
        $(document).on('keyup', function (e) {
            if (e.keyCode == 38) {
                CONSTS.stick2Speed = 0;
            }
        });
        $(document).on('keydown', function (e) {
            if (e.keyCode == 40) {
                CONSTS.stick2Speed = 5;
            }
        });
        $(document).on('keyup', function (e) {
            if (e.keyCode == 40) {
                CONSTS.stick2Speed = 0;
            }
        });

        //Pause event - Press 'P' to pause
        $(document).on('keydown', function (e) {
            // if key code is P and left speed of ball is not zero
            if (e.keyCode == 80 && (CONSTS.ballLeftSpeed !== 0 ) ) {
                $("#pausedText").show();

                const ballLastPosition = {
                    top: CSS.ball.top, 
                    left: CSS.ball.left, 
                    ballTopSpeed: CONSTS.ballTopSpeed,
                    ballLeftSpeed: CONSTS.ballLeftSpeed,
                    score1: CONSTS.score1,
                    score2: CONSTS.score2    
                };
                localStorage.setItem("ball", JSON.stringify(ballLastPosition));
                isGamePaused = true;
                CONSTS.ballTopSpeed = 0;
                CONSTS.ballLeftSpeed = 0;
            }
        });
        //Resume event - Press 'R' to resume
        $(document).on('keydown', function (e) {
            let ballLastPosition=JSON.parse(localStorage.getItem("ball"));
            if(e.keyCode == 82 && ballLastPosition && isGamePaused){
                $("#pausedText").hide();
                CONSTS.ballTopSpeed = ballLastPosition.ballTopSpeed;
                CONSTS.ballLeftSpeed = ballLastPosition.ballLeftSpeed;

                CSS.ball.top = ballLastPosition.top;
                CSS.ball.left = ballLastPosition.left;
                isGamePaused = false;
            }      
        });    
    }
    function roll() {
        //Move the ball - Json.parse is written bcz of the cross-tabs localstorage but couldnt have time to do it.
        CSS.ball.top = JSON.parse(localStorage.getItem("ball"))?.top || 292.5;
        CSS.ball.left = JSON.parse(localStorage.getItem("ball"))?.left || 443;

        let side = -1;

        if (Math.random() < 0.5) {
            side = 1;
        }
        CONSTS.ballTopSpeed = 0;
        CONSTS.ballLeftSpeed = 0;

        if(isGameStarted){
        setTimeout(function(){
            CONSTS.ballTopSpeed = side * (Math.floor(Math.random()*5));
            CONSTS.ballLeftSpeed =  (Math.random() * 2 + 3);
        },1000);
    }
    }

    function loop() {
        window.pongLoop = setInterval(function () {
            //Move the sticks
            CSS.stick1.top += CONSTS.stick1Speed;
            $('#stick-1').css('top', CSS.stick1.top); 
        
            CSS.stick2.top += CONSTS.stick2Speed;
            $('#stick-2').css('top', CSS.stick2.top);

            CSS.ball.top += CONSTS.ballTopSpeed;
            CSS.ball.left += CONSTS.ballLeftSpeed;

            //Stick Limitation
              if (CSS.stick1.top < 0) {
                CONSTS.stick1Speed = 5;
              } else if (CSS.stick1.top > CSS.arena.height - CSS.stick.height) {
                CONSTS.stick1Speed = -5;
              }
              if (CSS.stick2.top < 0) {
                CONSTS.stick2Speed = 5;
              } else if (CSS.stick2.top > CSS.arena.height - CSS.stick.height) {
                CONSTS.stick2Speed = -5;
              }
           
            //Wall collision
            if (CSS.ball.top <= 0 || CSS.ball.top >= CSS.arena.height - CSS.ball.height) {
                CONSTS.ballTopSpeed = CONSTS.ballTopSpeed * -1;
            }
            $('#pong-ball').css({top: CSS.ball.top, left: CSS.ball.left});

            //Stick collision and mirroring
            if (
                 CSS.ball.left <= CSS.stick.width &&
                 CSS.ball.top <= CSS.stick1.top + CSS.stick.height && 
                 CSS.ball.top >= CSS.stick1.top - CSS.ball.height
                ) {
                    CONSTS.ballLeftSpeed = CONSTS.ballLeftSpeed * -1;
                } 
            if (
                 CSS.ball.left >= (CSS.arena.width  - CSS.ball.width - CSS.stick.width) &&
                 CSS.ball.top <= CSS.stick2.top + CSS.stick.height && 
                 CSS.ball.top >= CSS.stick2.top - CSS.ball.height
                ){
                    CONSTS.ballLeftSpeed = CONSTS.ballLeftSpeed * -1;
                }
            //Making a Score
            if (CSS.ball.left <= 0 || CSS.ball.left >= CSS.arena.width - CSS.ball.width) {
                (CSS.ball.left <= 0) ? (CONSTS.score2 +=1) : (CONSTS.score1 +=1);
                score(CONSTS.score1, CONSTS.score2);
                localStorage.clear();
                   
                if(CONSTS.score1 === 5 || CONSTS.score2 === 5){
                    CONSTS.ballTopSpeed = 0;
                    CONSTS.ballLeftSpeed = 0;
                    CONSTS.score1 = 0;
                    CONSTS.score2 = 0;
                    CSS.ball.top = 292.5;
                    CSS.ball.left = 443;
                  
                    $("#startArea").show();
                    isGameStarted = false;
                }  
                roll();
            }
        }, CONSTS.gameSpeed);
    }
   //Displaying the score
    function score(score1, score2){
        $('#score-1').text(score1);
        $('#score-2').text(score2);
    }

    start(); 
})();