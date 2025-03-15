export const globalUtils = {
  getCellSize: ({gameSize, grid, margin}) => {
    const maxRowLength = grid.reduce((acc, {cells}) => Math.max(cells.length, acc), 0);
    const maxValue = Math.max(maxRowLength, grid.length);
    return (gameSize.width - 2 * margin) / maxRowLength - maxValue;
  }
};
