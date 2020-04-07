/**
 * Aplicação de algoritmo 'A* / Pathfiding' para estudo
 */

const FIELD_SIZE = 400;
const W_CANVAS = 440;
const H_CANVAS = 440;
const NODE_SIZE = 20;
const MOVE_G_DIAGONAL = 14;
const MOVE_G_VH = 10;

const TYPE_CELL = {
    Hero: {
        name: 'hero',
        color: 'purple'
    },
    Start: {
        name: 'start',
        color: 'green'
    },
    Obstacle: {
        name: 'obstacle',
        color: 'red'
    },
    End: {
        name: 'end',
        color: 'blue'
    },
    Floor: {
        name: 'floor',
        color: 'grey'
    }
};

const TYPE_MOVE = {
    DIAGONAL: 'diagonal',
    VH: 'vh'
};

/**
 * MAPS - Usado para construir os obstaculos e dizer onde será o nó inicio e fim
 * 
 * Definir objeto dizendo:
 * - Tipo com base em TYPE_CELL
 * - R para o número da linha
 * - C para o número da coluna
 * 
 * A chave de cada objeto aqui será a junção / concatenação de R e C
 * 
 * Obs.: O número de linha e coluna vai variar dependendo do tamanho do campo
 * e dos nós(cada célula do campo)
 */
const MAPS = {
    55: {
        'R': 5,
        'C': 5,
        'Type': TYPE_CELL.Start
    },
    46: {
        'R': 4,
        'C': 6,
        'Type': TYPE_CELL.Obstacle
    },
    56: {
        'R': 5,
        'C': 6,
        'Type': TYPE_CELL.Obstacle
    },
    66: {
        'R': 6,
        'C': 6,
        'Type': TYPE_CELL.Obstacle
    },
    62: {
        'R': 6,
        'C': 2,
        'Type': TYPE_CELL.Obstacle
    },
    63: {
        'R': 6,
        'C': 3,
        'Type': TYPE_CELL.Obstacle
    },
    64: {
        'R': 6,
        'C': 4,
        'Type': TYPE_CELL.Obstacle
    },
    65: {
        'R': 6,
        'C': 5,
        'Type': TYPE_CELL.Obstacle
    },
    61: {
        'R': 6,
        'C': 1,
        'Type': TYPE_CELL.Obstacle
    },
    18: {
        'R': 1,
        'C': 8,
        'Type': TYPE_CELL.Obstacle
    },
    28: {
        'R': 2,
        'C': 8,
        'Type': TYPE_CELL.Obstacle
    },
    38: {
        'R': 3,
        'C': 8,
        'Type': TYPE_CELL.Obstacle
    },
    48: {
        'R': 4,
        'C': 8,
        'Type': TYPE_CELL.Obstacle
    },
    1110: {
        'R': 11,
        'C': 10,
        'Type': TYPE_CELL.Obstacle
    },
    1111: {
        'R': 11,
        'C': 11,
        'Type': TYPE_CELL.Obstacle
    },
    1112: {
        'R': 11,
        'C': 12,
        'Type': TYPE_CELL.Obstacle
    },
    1113: {
        'R': 11,
        'C': 13,
        'Type': TYPE_CELL.Obstacle
    },
    1114: {
        'R': 11,
        'C': 14,
        'Type': TYPE_CELL.Obstacle
    },
    1115: {
        'R': 11,
        'C': 15,
        'Type': TYPE_CELL.Obstacle
    },
    1116: {
        'R': 11,
        'C': 16,
        'Type': TYPE_CELL.Obstacle
    },
    1117: {
        'R': 11,
        'C': 17,
        'Type': TYPE_CELL.Obstacle
    },
    1716: {
        'R': 17,
        'C': 16,
        'Type': TYPE_CELL.End
    }
};

var positionsNeighbors = {};
var rows, cols;
var openList = [];
var closeList = [];
var grid = [];
var mainNodes;
var path = [];
var hero, indexPath = 0;

function setup() {
    createCanvas(W_CANVAS, H_CANVAS);
    
    frameRate(3); // Definindo frameRate mais baixo para poder ver movimento devagar

    rows = FIELD_SIZE / NODE_SIZE;
    cols = FIELD_SIZE / NODE_SIZE;
    
    positionsNeighbors = {
        topLeft: (rows + 1) * -1,
        top: rows * -1,
        topRight: (rows-1) * -1,
        right: 1,
        bottomRight: (rows + 1),
        bottom: rows,
        bottomLeft: rows - 1,
        left: -1
    };

    mainNodes = createGrid(); // Pede para criar grid

    findPath(mainNodes.cellStart, mainNodes.cellEnd); // Pede para calcular caminho da grid
    path = executePath(mainNodes.cellEnd, []); // Executa a ordem do caminho
    hero = new Cell(mainNodes.cellStart.row, mainNodes.cellStart.column, TYPE_CELL.Hero); // Cria um hero para caminhar
}

function draw() {
    background(51);

    createNumberLineColumns(); // Imprime numeração de linhas e colunas

    // Desenha grid / campo
    for (var i = 0; i < grid.length; i++) {
        grid[i].show();
    }

    // Faz o herói / personagem andar
    if (indexPath < path.length) {
        hero.row += path[indexPath].row - hero.row;
        hero.column += path[indexPath].column - hero.column;
        indexPath++;
    }

    hero.show();
}

function createNumberLineColumns() {

    fill(255, 255, 255, 0);
    
    for (var r = 1; r <= rows; r++) {

        if (r > 0) {
            text(r, NODE_SIZE/2, ((r * NODE_SIZE) + (NODE_SIZE/2)));
            text(r, ((r * NODE_SIZE) + (NODE_SIZE/2)), NODE_SIZE/2);
            textAlign(CENTER);
        }
    }
}

function createGrid() {

    stroke('#ffffff');
    fill(255, 255, 255, 0);

    var cellStart, cellEnd;

    for (var r = 1; r <= rows; r++) {

        for (var c = 1; c <= cols; c++) {
            
            var m = MAPS[((r).toString() + (c).toString())];

            if (m) {

                var cell = new Cell(m.R, m.C, m.Type);

                if (m.Type.name == TYPE_CELL.Start.name) {
                    cellStart = cell;
                }

                if (m.Type.name == TYPE_CELL.End.name) {
                    cellEnd = cell;
                }
            } else {
                var cell = new Cell(r, c, TYPE_CELL.Floor);
            }

            grid.push(cell);
        }
    }

    return {
        cellStart,
        cellEnd
    };
}

function findPath(cellStart, cellEnd) {

    openList.push(cellStart);

    do {

        var currentNode = findLowerMovementCost();
        
        closeList.push(currentNode);

        var neighbors = neighborsNode(currentNode);

        neighbors.forEach(neighbor => {

            var isOpenList = isOnOpenList(neighbor);

            if (!isOpenList) {
                neighbor.setParent(currentNode);
                neighbor.calcH(cellEnd);
                neighbor.calcG();
                openList.push(neighbor);
            } else if (isOpenList && gIsLessBetween(currentNode, neighbor)) {
                neighbor.setParent(currentNode);
                neighbor.calcH(cellEnd);
                neighbor.calcG();
            }
        });
    }while(currentNode.type.name != cellEnd.type.name && openList.length > 0);
}

function findLowerMovementCost() {

    openList.sort(function(a, b) {
        return a.movementCost() - b.movementCost();
    });

    return openList.shift();
}

function neighborsNode(node) {

    var neighbors = [];
    var positionCurrentInArray = positionInArrayGrid(node);

    Object.entries(positionsNeighbors).forEach(([key, value]) => {

        if (!(node.column == 1 && (key == 'topLeft' || key == 'left' || key == 'bottomLeft')) && 
            !(node.column == cols && (key == 'topRight' || key == 'right' || key == 'bottomRight'))) {

            var neighbor = grid[positionCurrentInArray+value];

            if (neighbor != undefined && neighbor.type.name != TYPE_CELL.Obstacle.name && !isOnCloseList(neighbor)) {
                neighbors.push(neighbor);
            }
        }
    });

    return neighbors;
}

function isOnOpenList(node) {

    var found = false;

    openList.forEach(element => {

        if (node.position == element.position && node.type.name == element.type.name) {
            found = true;
        }

        return false;
    });

    return found;
}

function isOnCloseList(node) {

    var found = false;

    closeList.forEach(element => {

        if (node.position == element.position && node.type.name == element.type.name) {
            found = true;
        }

        return false;
    });

    return found;
}

function positionInArrayGrid(node) {

    return node.position - (rows + 1);
}

function gIsLessBetween(currentNode, neighbor) {

    var move = typeMove(currentNode, neighbor);

    if (move == TYPE_MOVE.DIAGONAL) {

        return (currentNode.g + MOVE_G_DIAGONAL) < neighbor.g;
    }

    return (currentNode.g + MOVE_G_VH) < neighbor.g;
}

function typeMove(nodeStart, nodeEnd) {

    var direction = nodeStart.position - nodeEnd.position;

    direction = (direction < 0)? direction * -1 : direction;

    if (direction == (rows+1) || direction == (rows-1)) {
        return TYPE_MOVE.DIAGONAL;
    } else {
        return TYPE_MOVE.VH;
    }
}

function executePath(node, list) {

    if (node.parent == null) {
        return list;
    }

    list.unshift(node);

    return executePath(node.parent, list);
}

function Cell(row, column, type) {

    this.row = row;
    this.column = column;
    this.position = (row*rows)+column;
    this.g = 0;
    this.h = 0;
    this.type = type;
    this.parent = null;

    this.show = function() {

        fill(this.type.color);
        rect(this.column * NODE_SIZE, this.row * NODE_SIZE, NODE_SIZE, NODE_SIZE);
    }

    this.calcG = function() {

        var move = typeMove(this.parent, this);

        if (move == TYPE_MOVE.DIAGONAL) {
            this.g += 14;
        } else {
            this.g += 10;
        }
    }

    this.calcH = function(nodeEnd) {

        var dtColumn = nodeEnd.column - this.column;
        var dtRow = nodeEnd.row - this.row;

        dtColumn = (dtColumn < 0)? dtColumn * -1 : dtColumn;
        dtRow = (dtRow < 0)? dtRow * -1 : dtRow;

        this.h = dtColumn + dtRow;
    }

    this.setParent = function(nodeParent) {
        this.parent = nodeParent;
    }

    this.movementCost = function() {
        return this.g + this.h;
    }
}