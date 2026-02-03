import type { SearchInfoDTO } from '../dto/searchInfo.dto';
import type { SearchInfo } from '../../model/searchInfo';
import { Gender } from '../../model/gender';

export const SearchInfoMapper = (dto: SearchInfoDTO): SearchInfo => {
    return {
        name: dto.name,
        enName: dto.enName,
        state: dto.state,
        gender: Gender[dto.gender as keyof typeof Gender],
        cckId: dto.cckId,
        wcaId: dto.wcaId,
    };
}