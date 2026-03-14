// Barrel for `src/pages`
// Add page exports here (route components)
export { MainPage } from './main/MainPage.tsx';
export { SearchPage } from "./search/SearchPage";
export { CompetitionPage } from './competition/CompetitionPage';
export { CompetitionStatisticsPage } from './competition/statistics/CompetitionStatisticsPage.tsx';
export { RoundPage } from '@/pages/competition/round/RoundPage';
export { RoundStatisticsPage } from '@/pages/competition/round/statistics/RoundStatisticsPage.tsx';
export { RankingPage } from './ranking/RankingPage';
export { NewRecordPage } from './new-record/NewRecordPage';
export { ProfilePage } from './profile/ProfilePage';
export { ProfileRecordHistoryPage } from './profile/record/ProfileRecordHistoryPage';
export { ConfirmPage } from './auth/ConfirmPage';
export { LogoutPage } from './auth/LogoutPage';
export { CompetitionAdminPage } from '@/pages/admin/competition/main/CompetitionAdminPage';
export { CompetitionCreatePage } from './admin/competition/create/CompetitionCreatePage';
export { CompetitionManagePage } from './admin/competition/manage/CompetitionManagePage';
export { RoundRecordEditPage } from '@/pages/admin/competition/round/RoundRecordEditPage';
export { AddCompetitorPage } from '@/pages/admin/competition/round/add-competitior/AddCompetitorPage.tsx';
export { RoundProjectorPage } from '@/pages/admin/competition/round/projector/RoundProjectorPage.tsx';
export { EventAdminPage } from './admin/event/EventAdminPage';
export { ScrambleAdminPage } from './admin/scramble/ScrambleAdminPage';

export { NotFoundPage } from './error/NotFoundPage.tsx';
export { ForbiddenPage } from './error/ForbiddenPage';
export { ComingSoonPage } from './error/ComingSoonPage';
