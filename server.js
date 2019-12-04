const Joi = require('joi');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/games', {useUnifiedTopology:true, useNewUrlParser:true})
.then(()=> console.log("Connected to mongodb..."))
.catch((err => console.error("could not connect to mongodb...", err)));


const gameSchema = new mongoose.Schema({
    place:Number,
    result:String,
    ranked:String,
    level:Number,
    champions:[String],
    clvl:[Number]
})

const Game = mongoose.model('Game',gameSchema);


async function createGame(game){
    const result = await game.save();
    console.log(result);
}

function validateGame(game){
    const schema = {
        place:Joi.number().max(8).required(),
        result:Joi.string().required(),
        ranked:Joi.string().required(),
        level:Joi.number().max(9).required(),
        champions:Joi.allow(),
        clvl:Joi.allow(),
    };
    return Joi.validate(game, schema);
}

app.post('/api/games',(req,res)=>{
    const result = validateGame(req.body);
    if(result.error){
        res.status(400).send(result.err.details[0].message);
        return;
    }
    const game = new Game({
        place:req.body.place,
        result:req.body.result,
        ranked:req.body.ranked,
        level:req.body.level,
        champions:req.body.champions,
        clvl:req.body.clvl
    });
    createGame(game);
    res.send(game);
});

async function getGames(res){
    const games = await Game.find();
    console.log(games);
    res.send(games);
}

app.get('/api/games', (req,res)=>{
    const games = getGames(res);
});

app.get('/api/games/:id', (req,res)=>{
    let game = getGame(req.params.id,res);
});

async function getGame(id,res){
    const game = await Game.findOne({_id:id});
    console.log(game);
    res.send(game);
}

//render our html page
app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html');
});

app.put('/api/games/:id',(req,res)=>{
    const result = validateGame(req.body);
    if(result.error){
        res.status(400).send(result.error.details[0].message);
        return;
    }
    updateGame(res,req.params.id, req.body.place, req.body.result, req.body.ranked, req.body.level, req.body.champions, req.body.clvl);
});
async function updateGame(res,id,place,result,ranked,level,champions,clvl){
    const result2 = await Game.updateOne({_id:id},{
        $set:{
            place: Number(place),
            result: result,
            ranked:ranked,
            level:level,
            champions:champions,
            clvl:clvl
        }
    })
    res.send(result2);
}

app.delete('/api/games/:id',(req,res)=>{
    const requestedId = req.params.id;
    console.log("deleting Id:"+requestedId);
    removeGame(res, requestedId)
});

async function removeGame(res, id){
    console.log("deleting Id2:"+id);

    const game = await Game.findByIdAndRemove(id);
    console.log("deleting Id3:"+id);

    res.send(game);
}
//listen
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`listening on port ${port}`);
});