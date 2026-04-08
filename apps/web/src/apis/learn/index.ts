import { serverApi, type Respone } from "..";
import type {ResultLearn} from '@en/common/learn'
import type { Word } from "@en/common/word";

export const getWordList = (courseId: string) => serverApi.get(`/learn/word/${courseId}`) as Promise<Respone<Word[]>>
export const saveWordMaster = (wordIds: string[]) => serverApi.post(`/learn/word/master`, {wordIds}) as Promise<Respone<ResultLearn>>