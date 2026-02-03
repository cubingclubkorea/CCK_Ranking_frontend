import { ssoClient } from '@/shared/api/auth_base';
import type { SearchInfo } from '../model/searchInfo';
import type { SearchInfoDTO } from './dto/searchInfo.dto';
import { SearchInfoMapper } from './mapper/searchInfoMapper';

const BASE_URL = '/api/admin';

export const getSearchInfo = async (searchTerm: string): Promise<SearchInfo[]> => {
  const data = await ssoClient.get<SearchInfoDTO[]>(`${BASE_URL}/search/${searchTerm}`);
  return data.map(SearchInfoMapper);
};