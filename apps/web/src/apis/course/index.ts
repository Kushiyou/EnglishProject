import { serverApi, type Respone } from ".."
import type { CourseList } from "@en/common/course"

//获取单词列表的API函数，接受一个WordQuery类型的查询参数，并返回一个包含WordList数据的Promise对象
export const getCourseList = (): Promise<Respone<CourseList>> => {
    return serverApi.get('/course/list') as Promise<Respone<CourseList>>;
}