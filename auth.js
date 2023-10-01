const bcrypt=require('bcryptjs')


const hashPassword=async(password)=>{
    const salt=await bcrypt.genSalt(8)
    let hashedPassword=await bcrypt.hash(password,salt)
    console.log(hashedPassword)
    return hashedPassword
}

const compare=async(password,hashedPassword)=>{
    return bcrypt.compare(password,hashedPassword)
}

module.exports={hashPassword,compare}