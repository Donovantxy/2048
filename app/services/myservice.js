/**
 * Created by Fulvio Cosco on 27/04/2014.
 */

app.factory("$2048", function(){
    var Game = function(scope, _grid){//37< - 38^ - 39> - 40v
          grid = new Grid(_grid);
          this.move = function(dir){ grid.move(dir); }
          this.getHowManyFilledSq = function(){ return grid.getHowManyFilledSq(); };
    }

 return Game;

});



var Grid = function(_grid){
    var _this = this;
    var grid = _grid;
    var sizeGr = grid.length;
    var freeSq = []; //["row,col"]
    var filledSq = []; //["row,col", squareObj]
    var howManyFreeInRow = [];//how many noSq are per any row
    var howManyFreeInCol = [];//how many noSq are per any column

    /*
    * Check the grid filled squares and empty squares, furthermore it updates
    * freeSq, filledSq, howManyFreeInRow and howManyFreeInCol
    * */
    var checkSq = function(){
        freeSq = [];
        filledSq = [];
        howManyFreeInRow = [];
        howManyFreeInCol = [];

        for(var i=0; i<sizeGr; i++){
            contR = 0;
            for(var j= 0; j<sizeGr; j++){
                if(!grid[i][j]){
                    freeSq.push(i+","+j);
                    contR++;
                    howManyFreeInCol[j] = !howManyFreeInCol[j] ? 1 : (howManyFreeInCol[j]+1);
                }
                else{
                    howManyFreeInCol[j] = !howManyFreeInCol[j] ? 0 : howManyFreeInCol[j];
                    filledSq.push(grid[i][j]);
                    grid[i][j].setRC(i,j);
                    grid[i][j].move();
                    grid[i][j].setColor("black");

                }
                howManyFreeInRow[i] = contR;

            }
        }
        //console.log(freeSq, filledSq);
        //console.log(howManyFreeInRow, howManyFreeInCol);
    }//***

    /*
    * resetReplacedSqFalse - resets the value isReplaced at the original value (false) for any square into the grid
    * */
    var resetReplacedSqFalse = function(){
        for (var i = 0; i < filledSq.length; i++){ filledSq[i].isReplaced=false; }
    }

    this.getHowManyFilledSq = function(){ return filledSq.length; }

    var countNewSq = 0;
    this.putNewSq = function(){
        if(freeSq.length>0){
            countNewSq++;
            newNumber = Math.random()<0.8 ? 2 : 4;
            newPosition = parseInt(Math.round(Math.random() * (freeSq.length - 1)));
            //console.log(newPosition, freeSq);
            r = parseInt(freeSq[newPosition].split(",")[0]);
            c = parseInt(freeSq[newPosition].split(",")[1]);
            grid[r][c] = new Square(newNumber, r, c, grid);
            checkSq();
            grid[r][c].setColor("red");
        }
    }//***



    this.move = function(dir, onlyMove){
        var isSomeMoved = false;

        filledSq_copy = dir>38 ? filledSq.slice().reverse() : filledSq;

        for (var i = 0; i < filledSq_copy.length; i++) {//console.log(i);
                sq = filledSq_copy[i];
                sqrc = sq.getRC();
                shifts = 0;
                replaced = false;

                //console.log(sq, i);
                switch(dir){
                    case 37:
                        while ((sqrc[1] - shifts - 1) > -1 && !grid[sqrc[0]][sqrc[1] - shifts - 1]) {
                            shifts++;
                        }

                        if (shifts > 0) {
                            grid[sqrc[0]][sqrc[1] - shifts] = sq;
                            grid[sqrc[0]][sqrc[1]] = false;
                            isSomeMoved = true;
                        }

                         isSomeMoved = !!onlyMove ? isSomeMoved : this.replaceSq(sqrc[0], sqrc[1], true, -shifts, -1, sqrc[1]-1>-1, isSomeMoved, dir);
                        shifts = 0;

                    break;

                    case 38:
                        while ((sqrc[0] - shifts - 1) > -1 && !grid[sqrc[0] - shifts - 1][sqrc[1]]){
                            shifts++;
                        }

                        if (shifts > 0) { //console.log("shifts>0");
                            grid[sqrc[0] - shifts][sqrc[1]] = sq;
                            grid[sqrc[0]][sqrc[1]] = false;
                            isSomeMoved = true;
                        }

                        isSomeMoved = !!onlyMove ? isSomeMoved : this.replaceSq(sqrc[0], sqrc[1], false, -shifts, -1, (sqrc[0] - shifts - 1) > -1, isSomeMoved, dir);
                        shifts = 0;

                    break;

                    case 39:
                        isReversed_illefSq = false;
                        while ((sqrc[1] + shifts + 1) < sizeGr && !grid[sqrc[0]][sqrc[1] + shifts + 1]) {
                            shifts++;
                        }

                        if (shifts > 0) {
                            grid[sqrc[0]][sqrc[1] + shifts] = sq;
                            grid[sqrc[0]][sqrc[1]] = false;
                            isSomeMoved = true;
                        }

                        isSomeMoved = !!onlyMove ? isSomeMoved : this.replaceSq(sqrc[0], sqrc[1], true, shifts, 1, (sqrc[1] + shifts + 1) < sizeGr, isSomeMoved, dir);
                        shifts = 0;
                    break;

                    case 40:
                        isReversed_illefSq = false;
                        while ((sqrc[0] + shifts + 1) < sizeGr && !grid[sqrc[0] + shifts + 1][sqrc[1]]) {
                            shifts++;
                        }

                        if (shifts > 0) {
                            grid[sqrc[0] + shifts][sqrc[1]] = sq;
                            grid[sqrc[0]][sqrc[1]] = false;
                            isSomeMoved = true;
                        }

                        isSomeMoved = !!onlyMove ? isSomeMoved : this.replaceSq(sqrc[0], sqrc[1], false, shifts, 1, (sqrc[0] + shifts + 1) < sizeGr, isSomeMoved, dir);
                        shifts = 0;
                    break;

                }//SWITCH

            }//FOR

            if(isSomeMoved){ this.putNewSq(); }
            resetReplacedSqFalse();


    }//***


    /*
    * Replace two adjacent squares
    * r: row, c: column, BF: back (-1) or forward (+1),
    * RL_or_UD: right and left or up and down
    * */
    this.replaceSq = function(r, c, RL_or_UD, shifts, BF, limitGridCondition, isSomeMoved, dir) {
        //console.log([r,c]+" *********************************
        if (RL_or_UD) {
            if((limitGridCondition && !!grid[r][c + shifts + BF]) && (grid[r][c + shifts].getVal() == grid[r][c + shifts + BF].getVal() )) {
                if( !grid[r][c + shifts + BF].isReplaced ){
                    grid[r][c + shifts + BF].setVal(grid[r][c + shifts].getVal() * 2);
                    grid[r][c + shifts + BF].upDateValImg();

                    this.remove(r, c+shifts, grid[r][c + shifts + BF]);

                    grid[r][c + shifts + BF].isReplaced = true;
                    checkSq();

                    return true;
                }
            }
        }
        else {
            if ((limitGridCondition && !!grid[r + shifts + BF][c]) && (grid[r + shifts][c].getVal() == grid[r + shifts + BF][c].getVal() )) {
                if( !grid[r + shifts + BF][c].isReplaced ) {
                    grid[r + shifts + BF][c].setVal(grid[r + shifts + BF][c].getVal() * 2);
                    grid[r + shifts + BF][c].upDateValImg();

                    this.remove(r + shifts, c, grid[r + shifts + BF][c]);

                    grid[r + shifts + BF][c].isReplaced = true;
                    checkSq();

                    return true;
                }
            }
        }

        checkSq();
        return isSomeMoved;
    }//***


    this.remove = function(r, c, holdingSq){
        grid[r][c].delSquareImg(holdingSq);
        grid[r][c] = false;
    };


    this.init = function(){
        checkSq();
        _this.putNewSq();
        _this.putNewSq();
        //for(jj=0; jj<14; jj++){ _this.putNewSq(); }
    }//***
    this.init();

}





/*
* Square obj represents the filled square inside the grid
* */
var Square = function(val, _r, _c, _grid){
    var _this = this;
    var c = _c;//column
    var r = _r;//row
    var grid = _grid;
    var val = val;
    var sides = {};
    var color = "black";
    this.isReplaced = false;
    this.domel = null;
    var margin = 10;//amount of pixel top left and between two adiacent squares
    var lside = 100;//width/height of square

    //*** functions ***//
    this.getVal = function(){ return val; }
    this.setVal = function(_val){ val=_val; }
    this.getRC = function(){ return [r,c]; }
    this.setRC = function(_r,_c){ r=_r, c=_c; }
    this.getColor = function(){ return color; }
    this.setColor = function(_color){ this.domel.css("color", _color); }


    /******************************* DOM ********************************/


    this.injSquareImg = function(){
        this.domel = $('<div class="sqImg"><span>'+this.getVal()+'</span></div>').css({"top": (r*(lside+margin)+margin), "left": (c*(lside+margin)+margin)}).appendTo($("#wrap"));
        span = this.domel.find("span");
        span.css({"width":10, "height":10, "font-size": 4, "line-height":4, "left":20, "top":20, "z-index":"100"}).animate({
            "width":100,
            "height":100,
            "font-size":80,
            "line-height":100,
            "top":0,
            "left":0,
            "z-index":"5"
        }, 200, "easeOutBack");

    }

    this.move = function(){ //console.log(r, c);
        this.domel.css({ "top": (this.getRC()[0]*(lside+margin)+margin), "left": (this.getRC()[1]*(lside+margin)+margin) });
    }

    this.upDateValImg = function(){
        span = this.domel.find("span");
        rgb = span.css("background-color").replace(/[a-z\(\) ]*/g, "").split(",");
        rgb[0] = parseInt(rgb[0])-10; rgb[1] = parseInt(rgb[1])-10;
        val = this.getVal();
        font_size = (val+"").length == 1 ? 80 : ((val+"").length==2 ? 70 : ((val+"").length==3 ? 60 : 40 ));
        span.text(this.getVal()).css({"font-size":"100px", "color":"red", "opacity":0, "z-index":20}).animate(
            {"font-size":font_size, "color":"black", "opacity":1, "z-index":5, "background-color":"rgb("+rgb[0]+","+rgb[1]+",180)"},
            500
        );

    }

    this.delSquareImg = function(holdingSq){
        this.domel.css({"z-index":"10", "opacity":0, "top":holdingSq.domel.css("top"), "left":holdingSq.domel.css("left") })
            .delay(1000).queue(function(){ $(this).remove(); });

    }


    var init = function(){
        _this.setRC(r, c);
        _this.injSquareImg();
    }
    init();
    return this;

};


