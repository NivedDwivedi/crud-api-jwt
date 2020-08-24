const express=require('express');
const fs=require('fs');
const router=express.Router();


const courseData='json/course.json';
const studentData='json/student.json';




// all courses details
router.get('/', (req, res)=>{
    let data=JSON.parse(fs.readFileSync(courseData));
    res.send({data, error:null}); 
});


//Specific course detail
router.get('/:id', (req, res)=>{
    let id=req.params.id;
    let flag=0;
    let data=JSON.parse(fs.readFileSync(courseData));
    
    data.forEach(element => {
        if(element.id==parseInt(id))
        {
            res.send(element);
            flag=1;
        }
    });
    if(flag==0)
    {
        res.send("No Course available with this ID");
    }
    
});


//Adding a course
router.post('/', (req,res)=>{

    let name = req.body.name;
    let description = req.body.description;
    let availableSlots = req.body.availableSlots;
    if (!name  || !description || !availableSlots )
    {
        return res.send("Entry is Invalid");
    }

    let data=JSON.parse(fs.readFileSync(courseData));
    if(typeof name == "string" && typeof description=="string" && typeof availableSlots=="number" && availableSlots>0)
    {
        let obj= {
            "id": data.length+1,
            "name":name,
            "description":description,
            "availableSlots":availableSlots,
            enrolledStudents: []
        };
        data.push(obj);
        
        fs.writeFileSync(courseData, JSON.stringify(data, null, 2));
        return res.send({ data: "Success", error: null });
    }
    else{
        return res.send("Invalid entry");
    }
    
});





//Enroll a student to a course if stots are available
router.post('/:id/enroll', (req, res)=>{
    let courseId=req.params.id;
    let studentId=req.body.studentId;
    let name;
    let flag=0,i=0;
    let course_index, student_index;
    let coursedata=JSON.parse(fs.readFileSync(courseData));
    let studentdata=JSON.parse(fs.readFileSync(studentData));
    
    if(req.id!=studentId)
    {
        //console.log(req.id);
        return res.send("You can't enroll another student");
    }
    if(typeof studentId!='number')
    {
        return res.send("Invalid entry");
    }
    studentdata.forEach(element => {
        if(element.id==studentId)
        {   
            flag=1;
            student_index=i;
            name=element.name;
            //console.log(student_index);
        } 
        i++;  
    });
    if(flag==0)
    {
        return res.send("No student exist with the given Id");
    }
    flag=0;i=0;
    coursedata.forEach(element => {
        if(element.id==courseId)
        { 
            flag=1;
            course_index=i;   
        }
        i++;
    });
    
    if(flag==0)
    {
        return res.send("No course exist with the given Id");
    }
    if (coursedata[course_index]["availableSlots"] == 0)
    {
        return res.send("No slots are available");
    }
    else
    {
        if(flag!=0)
        {
            coursedata[course_index]["availableSlots"] -= 1;
            let obj={
                "id":studentId,
                "name":name
            }
            let present=0;
            coursedata[course_index]["enrolledStudents"].forEach(element=>{
            if(studentId==element.id)
            {
                present=1;
                return res.send("Student already enrolled");
            }
            });

            if(present==0)
            {
                coursedata[course_index]["enrolledStudents"].push(obj);
                fs.writeFileSync(courseData, JSON.stringify(coursedata, null, 2));
                return res.send({ data: "Success", error: null });
            } 
            
        }   
    }
});

//Remove a student from course 
router.put('/:id/deregister', (req, res)=>{
    let courseId=req.params.id;
    let studentId=req.body.studentId;
    let flag=0, i=0;
    let course_index,student_index;
    let coursedata=JSON.parse(fs.readFileSync(courseData));
    let studentdata=JSON.parse(fs.readFileSync(studentData));
    if(req.id!=studentId)
    {
        return res.send("You can't deregister another student");
    }
    if(typeof studentId!="number")
    {
        return res.send("Invalid student id");
    }
    studentdata.forEach(element => {
        if(element.id==studentId)
        {   
            flag=1;
            student_index=i;
        }
        i++;   
    });
    if(flag==0)
    {
        return res.send("No student exist with the given Id");
    }
    flag=0;i=0;

    coursedata.forEach(element => {
        if(element.id==courseId)
        {
            flag=1;
            course_index=i;  
        }
        i++;
    });
    if(flag==0)
    {
        return res.send("No course exist with the given Id");
    }
    let index=0, found=0;
    if (flag!=0)
    {
        coursedata[course_index]["availableSlots"] += 1;
        coursedata[course_index]["enrolledStudents"].forEach(element => {
           if(element.id==studentId)
           {
                coursedata[course_index]["enrolledStudents"].splice(index,1);
                found=1;
           } 
           index++;
        });
        if(found==0)
        {
            return res.send(`Student with id:${studentId} is not enrolled in the course ${courseId}`);
        }
        else
        {
            fs.writeFileSync(courseData, JSON.stringify(coursedata, null, 2));
            return res.send({ data: "Success", error: null });
        }
        
    }
});

module.exports=router;