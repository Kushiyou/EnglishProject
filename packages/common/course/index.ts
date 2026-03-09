export interface Course {
    id: string; //课程id
    name: string; //课程名字
    value: string; // 课程标识 是什么领域的
    description?: string; //课程描述
    teacher: string; //课程教师
    url: string; //课程封面minio地址
    price: number; //课程价格
}

export type CourseList = Course[];