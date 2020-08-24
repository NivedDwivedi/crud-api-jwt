const express=require('express');
const fs=require('fs');
const router=express.Router();

const studentData='json/student.json';




//Get details of all the student
router.get('/', (req, res)=>{
    let data=JSON.parse(fs.readFileSync(studentData));

    res.send({data, error:null});
});


//Get student details by id
router.get('/:id', (req, res)=>{
    let id=req.params.id;
    let flag=0;
    let data=JSON.parse(fs.readFileSync(studentData));
    data.forEach(element => {
        if(element.id==parseInt(id))
        {
            res.send(element);
            flag=1;
        }
    });
    if(flag==0)
    {
        res.send("No student available with this ID");
    }

});


//Add a student
router.post('/', (req, res)=>{

    let name=req.body.name;
    let studentdata=JSON.parse(fs.readFileSync(studentData));
    if(typeof name!="string")
    {
        return res.send("Invalid Entry!");
    }
    let obj={
            "id": studentdata.length+1,
            "name":name
    };
    studentdata.push(obj);
    fs.writeFileSync(studentData, JSON.stringify(studentdata, null, 2));
    res.send({data:"Success", error:null});
});

module.exports=router;