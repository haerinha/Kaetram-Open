#!/usr/bin/env -S yarn ts-node-script

import world from '@kaetram/server/data/map/world.json';

class Helper {
    #width = world.width;
    #height = world.height;

    public constructor() {
        const stdin = process.openStdin();

        stdin.on('data', (data: string) => {
            const message = data.toString().replace(/(\r\n|\n|\r)/gm, '');
            const value = parseInt(message);

            if (isNaN(value)) return;

            const position = this.indexToGridPosition(value + 1);
            const adjustedIndex = this.gridPositionToIndex(position.x, position.y, 700);

            console.log(position);
            console.log(adjustedIndex);
        });
    }

    // private findDoorId(doors: any, x: number, y: number) {
    //     for (const i in doors)
    //         if (doors[i].x === x * 16 && doors[i].y === y * 16) return doors[i].id;

    //     return null;
    // }

    // private getTileData(x: number, y: number): void {
    //     const index = this.gridPositionToIndex(x, y);

    //     console.log(
    //         `"${index}": { "data": [${
    //             world.data[index]
    //         }], "isColliding": ${world.collisions.includes(index)} },`
    //     );
    // }

    private gridPositionToIndex(x: number, y: number, width?: number): number {
        return y * (width || this.#width) + x;
    }

    private indexToGridPosition(tileIndex: number): { x: number; y: number } {
        tileIndex -= 1;

        const x = this.getX(tileIndex + 1, this.#width);
        const y = Math.floor(tileIndex / this.#height);

        return {
            x,
            y
        };
    }

    private getX(index: number, width: number): number {
        if (index === 0) return 0;

        return index % width === 0 ? width - 1 : (index % width) - 1;
    }
}

export default new Helper();
