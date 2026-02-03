import { ssoClient } from '@/shared/api/auth_base';
import type { PlayerInfo } from '../model/playerInfo';
import type { PlayerInfoDTO } from './dto/playerInfo.dto';
import { PlayerInfoMapper } from '../api/mapper/playerInfoMapper';

const BASE_URL = '/api/rfid';

export const getPlayerInfo = async (uid: string): Promise<PlayerInfo> => {
  const data = await ssoClient.get<PlayerInfoDTO>(`${BASE_URL}/info/${uid}`);
  return PlayerInfoMapper(data);
};