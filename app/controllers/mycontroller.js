/**
 * Created by Fulvio Cosco on 27/04/2014.
 */
var dimensionGrid = 4;
var app = angular.module("my2048", []);

app.controller("myCtrl", ["$scope", "$2048", function($scope, $2048){

    //$scope.grid = new Array([null, null, null, null], [ null, null, null, null], [ null, null, null, null], [ null, null, null, null]);
    $scope.grid = new Array();
    for(var i=0; i<dimensionGrid; i++){ $scope.grid[i] = new Array(dimensionGrid); }

    $scope.game = new $2048($scope, $scope.grid );

    $scope.howManyFilledSq = 0;

    $scope.command = function(ev){
        if(ev.which>36 && ev.which<41){
            $scope.game.move(ev.which);

            newNumberOfSq = $scope.game.getHowManyFilledSq();
            if(newNumberOfSq-$scope.howManyFilledSq > 2 ) myColor = "red";
            else myColor = "black";
            $scope.howManyFilledSq = newNumberOfSq;

        }
    }

       arr = [1,2, , 5];
       delete arr[0];
       //console.log(undefined, !undefined, !!undefined, arr[1], !arr[1], !!arr[1]);




}]);


/*
function fizzbuzz(start, end){
    if(start>end){ return; }

    var str = !(start%3) ? "Fizz" : "";
    str += !(start%5) ? "Buzz" : "";
    console.log( str.length>0 ? str : start );
    return fizzbuzz(++start, end);
}

fizzbuzz(1, 100);
*/