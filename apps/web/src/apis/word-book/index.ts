import { serverApi, type Respone } from ".."
import type { WordList, WordQuery } from "@en/common/word"

//获取单词列表的API函数，接受一个WordQuery类型的查询参数，并返回一个包含WordList数据的Promise对象
export const getWordBookList = (params: WordQuery): Promise<Respone<WordList>> => {
   return serverApi.get('/word-book', { params })as Promise<Respone<WordList>>;
}