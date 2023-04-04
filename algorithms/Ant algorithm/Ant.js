let antTarget = {home: 'home', food: 'food'};
let sniffRange = 5;
let markerIntensity = 100;
function transitionProb(antX, antY, dir, tileX, tileY, marker1, clock)
{
    let dirVec = {x: Math.cos(dir), y: Math.sin(dir)};
    let tileVec = {x: tileX - antX, y: tileY - antY};
    let scalar = dirVec.x * tileVec.x + dirVec.y * tileVec.y;
    let modul = Math.sqrt(tileVec.x * tileVec.x + tileVec.y * tileVec.y);
    let angle = Math.acos(scalar/modul);
    return (1 - angle/Math.PI) + marker1/255 * (Math.random()*1.7 - 0.7) //* (1-Math.exp(-0.05*clock))  //- marker2/255*0.5;
}

function angleVectors(x1, y1, x2, y2)
{
    let scalar = x1 * x2 + y1 * y2;
    let modul1 = Math.sqrt(x1 * x1 + y1 * y1);
    let modul2 = Math.sqrt(x2 * x2 + y2 * y2);
    let angle = Math.acos(scalar/(modul1*modul2));
    if(y2 < 0) angle = -angle;
    return angle;
}

function getMarker(x, y, field, fieldSizeX, fieldSizeY, color)
{
    if(x < 0 || x >= fieldSizeX || y < 0 || y >= fieldSizeY) return 0;
    if(color == 'r') return field[(y*fieldSizeX+x)*3];
    else return field[(y*fieldSizeX+x)*3+2];
}

export class Ant{
    constructor(pos)
    {
        //this.pos = {x:100, y:100};
        this.pos = pos;
        this.speed = 1;
        this.target = antTarget.food;
        this.clock = 0;
        this.randDir();
    }
    randDir = function()
    {
        this.dir = Math.random() * 2 * Math.PI;
    }
    doStep = function(field, fieldSizeX, fieldSizeY, objId)
    {   
        let x = Math.ceil(this.pos.x)
        let y = Math.ceil(this.pos.y)


        if(field[(y*fieldSizeX+x)*3 + 1] == objId.food && this.target == antTarget.food)
        {
            this.target = antTarget.home;
            this.dir -= Math.PI;
            this.clock = 0;
        }
        if(field[(y*fieldSizeX+x)*3 + 1] == objId.home && this.target == antTarget.home) 
        {
            this.target = antTarget.food;
            this.dir -= Math.PI;
            this.clock = 0;
        }

        if(this.target == antTarget.food)
        {
            field[(y*fieldSizeX+x)*3] += markerIntensity * Math.exp(-0.005 * this.clock);
            //field[(y*fieldSizeX+x)*3] = Math.max(field[(y*fieldSizeX+x)*3], markerIntensity * Math.exp(-0.005 * this.clock));
            if(field[(y*fieldSizeX+x)*3]>255) field[(y*fieldSizeX+x)*3] = 255;
        }
        else
        {
            field[(y*fieldSizeX+x)*3 + 2] += markerIntensity * Math.exp(-0.005 * this.clock);
            //field[(y*fieldSizeX+x)*3 + 2] = Math.max(field[(y*fieldSizeX+x)*3 + 2], markerIntensity * Math.exp(-0.005 * this.clock));
            if(field[(y*fieldSizeX+x)*3 + 2]>255) field[(y*fieldSizeX+x)*3 + 2] = 255;
        }

        //this.dir += Math.sin(x*y+1)*Math.random()*0.3;
        // this.dir += (Math.random() - 0.5) * Math.PI/8;

        let maxProb = 0;
        let tile;
        for (let i = x - sniffRange; i <= x + sniffRange; i++) {
            for (let j = y - sniffRange; j <= y + sniffRange; j++) {
                if(i == x && j == y) continue;
                if(-1 <= i && i < fieldSizeX+1 && -1 <= j && j < fieldSizeY+1)
                {
                    let marker1, marker2;
                    if(this.target == antTarget.food) 
                    {
                        marker1 = getMarker(i, j, field, fieldSizeX, fieldSizeY, 'b')
                        marker2 = getMarker(i, j, field, fieldSizeX, fieldSizeY, 'r')
                    }
                    else 
                    {
                        marker1 = getMarker(i, j, field, fieldSizeX, fieldSizeY, 'r')
                        marker2 = getMarker(i, j, field, fieldSizeX, fieldSizeY, 'b')
                    }
                    let prob = transitionProb(x, y, this.dir, i, j, marker1, this.clock);
                    if(prob > maxProb)
                    {
                        maxProb = prob;
                        tile = {x:i, y:j};
                    }
                }
            }
        }


        this.dir = angleVectors(1, 0, tile.x - x, tile.y - y);
        this.dir += (Math.random() - 0.5) * Math.PI/8;

        let newPosX = this.pos.x + Math.cos(this.dir) * this.speed;
        let newPosY = this.pos.y + Math.sin(this.dir) * this.speed;


        if(0 <= newPosX && newPosX < fieldSizeX-1)
        {
            this.pos.x = newPosX;
        }
        else
        {
            if(Math.sin(this.dir) < 0)
                this.dir = Math.PI*2 - Math.acos(-Math.cos(this.dir));
            else
                this.dir = Math.acos(-Math.cos(this.dir));
        }
        if(0 <= newPosY && newPosY < fieldSizeY-1)
        {
            this.pos.y = newPosY;
        }
        else
        {
            this.dir = -this.dir;
        }

        this.clock++;
    }
}