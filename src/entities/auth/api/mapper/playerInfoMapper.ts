import type { PlayerInfoDTO } from '../dto/playerInfo.dto';
import type { PlayerInfo } from '../../model/playerInfo';

export const PlayerInfoMapper = (dto: PlayerInfoDTO): PlayerInfo => ({
    name: dto.name,
    state: dto.state,
    cckId: dto.cckId,
});