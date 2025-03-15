export const globalUtils = {
  getCellSize: ({gameSize, grid, margin}) => {
    const maxRowLength = grid.reduce((acc, {cells}) => Math.max(cells.length, acc), 0);
    const maxValue = Math.max(maxRowLength, grid.length);
    return (Math.min(gameSize.width, gameSize.height * 0.7) - 2 * margin) / maxRowLength - maxValue;
  },
  generateNumberPairs: (count, partials) => {
    const result = [];

    const backtrack = (current, remaining, count) => {
      if (count === partials) {
        !remaining && result.push([...current]);
        return;
      }

      const start = current.length ? current[current.length - 1] : 1;

      for (let i = start; i <= remaining; i++) {
        current.push(i);
        backtrack(current, remaining - i, count + 1);
        current.pop();
      }
    };

    backtrack([], count, 0);

    return result;
  }
};
