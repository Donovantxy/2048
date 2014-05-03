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
                    grid[i][j].setColor("black");
                }
                howManyFreeInRow[i] = contR;

            }
        }
        //console.log(freeSq, filledSq);
        //console.log(howManyFreeInRow, howManyFreeInCol);
    }//***

    /*
    * resetReplacedSqFalse: resets the value isReplaced at the original value (false) for any square into the grid
    * */
    var resetReplacedSqFalse = function(){
        for (var i = 0; i < filledSq.length; i++){ filledSq[i].isReplaced=false; }
    }

    this.getHowManyFilledSq = function(){ return filledSq.length; }

    var countNewSq = 0;
    this.putNewSq = function(){
        if(freeSq.length>0){
            countNewSq++;
            newNumber = 2;//Math.random()<0.8 ? 2 : 4;
            newPosition = parseInt(Math.round(Math.random() * (freeSq.length - 1)));
            //console.log(newPosition, freeSq);
            r = parseInt(freeSq[newPosition].split(",")[0]);
            c = parseInt(freeSq[newPosition].split(",")[1])
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

            if(isSomeMoved) this.putNewSq();
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
                    grid[r][c + shifts] = false;
                    grid[r][c + shifts + BF].isReplaced = true;
                    checkSq();
                    //this.move(dir, true);
                    return true;
                }
            }
        }
        else {
            if ((limitGridCondition && !!grid[r + shifts + BF][c]) && (grid[r + shifts][c].getVal() == grid[r + shifts + BF][c].getVal() )) {
                if( !grid[r + shifts + BF][c].isReplaced ) {
                    grid[r + shifts + BF][c].setVal(grid[r + shifts + BF][c].getVal() * 2);
                    grid[r + shifts][c] = false;
                    grid[r + shifts + BF][c].isReplaced = true;
                    checkSq();
                    //this.move(dir, true);
                    return true;
                }
            }
        }

        checkSq();
        return isSomeMoved;
    }//***


    this.init = function(){
        checkSq();
        _this.putNewSq();
        _this.putNewSq();
        //for(jj=0; jj<14; jj++){ _this.putNewSq(); }
    }//***
    this.init();

}



var Square = function(val, _r, _c, _grid){
    var _this = this;
    var c = _c;//column
    var r = _r;//row
    var grid = _grid;
    this.ID = r+":"+c;
    var val = val;
    var sides = {};
    var color = "black";
    this.isReplaced = false;


    //*** functions ***//
    this.getVal = function(){ return val; }
    this.setVal = function(_val){ val=_val; }
    this.getRC = function(){ return [r,c]; }
    this.setRC = function(_r,_c){ r=_r, c=_c; this.ID = r+","+c; }
    this.getColor = function(){ return color; }
    this.setColor = function(_color){ color = _color; }

    var init = function(){
        _this.setRC(r, c);
    }
    init();

    return this;

}


