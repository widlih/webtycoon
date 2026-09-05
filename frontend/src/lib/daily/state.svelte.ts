/** Общее состояние модалки ежедневной награды: открыть можно из шапки или автоматически при входе. */
class DailyUi {
	open = $state(false);
}

export const dailyUi = new DailyUi();
