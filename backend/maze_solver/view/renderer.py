import tempfile
import textwrap
import webbrowser
from dataclasses import dataclass

from functools import partial

from maze_solver.models.maze import Maze
from maze_solver.models.role import Role
from maze_solver.models.solution import Solution
from maze_solver.models.square import Square
from maze_solver.view.decomposer import decompose
from maze_solver.view.primitives import Point, Polyline, Rect, Text, tag

ROLE_EMOJI = {
    # Role.ENTRANCE: "\N{pedestrian}",
    Role.EXIT: "\N{chequered flag}",
    Role.ENEMY: "\N{ghost}",
    Role.REWARD: "\N{white medium star}",
}


@dataclass(frozen=True)
class SVG:
    xml_content: str

    @property
    def html_content(self) -> str:
        return textwrap.dedent(
            """\
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>SVG Preview</title>
        </head>
        <body>
        {0}
        </body>
        </html>"""
        ).format(self.xml_content)

    def preview(self) -> None:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", suffix=".html", delete=False
        ) as file:
            file.write(self.html_content)
        webbrowser.open(f"file://{file.name}")


@dataclass(frozen=True)
class SVGRenderer:
    square_size: int = 100
    line_width: int = 6

    @property
    def offset(self):
        return self.line_width // 2

    def render(self, maze: Maze, solution: Solution | None = None) -> SVG:
        margins = 2 * (self.offset + self.line_width)
        width = margins + maze.width * self.square_size
        height = margins + maze.height * self.square_size
        return SVG(
            tag(
                "svg",
                self._get_body(maze, solution),
                xmlns="http://www.w3.org/2000/svg",
                stroke_linejoin="round",
                width=width,
                height=height,
                viewBox=f"0 0 {width} {height}",
            )
        )

    def _draw_counter_label(self, name: str, squares: list[Square], square_size: int, offset: int) -> str:
        # Compute center of label by averaging positions
        avg_col = sum(sq.column for sq in squares) / len(squares)
        avg_row = sum(sq.row for sq in squares) / len(squares)

        point = Point(
            x=avg_col * square_size + offset + square_size // 2,
            y=avg_row * square_size + offset + square_size // 2,
        )
        return Text(name, point).draw(
            font_size=f"{square_size // 2}px",
            text_anchor="middle",
            dominant_baseline="middle",
            fill="black",
            font_weight="bold",
        )

    def _get_body(self, maze: Maze, solution: Solution | None) -> str:
        counter_labels = {
            "frozen food": maze[18:24],
            "meat": maze[27:33],
            "spices": maze[52:59],
            "dairy": maze[60:67],
            "pulses & grains": maze[89:98],
            "canned": maze[123:127],
            "packaged": maze[128:132],
            "beverages": maze[157:161],
            "snacks": maze[162:166],
            "fruits & vegetables": maze[191:200],
            "household": maze[222: 229],
            "stationary": maze[230: 237],
            "electronics": maze[257: 263],
            "footwear": maze[264: 270],
            "men cloth": maze[290: 294],
            "kids cloth": maze[295: 300],
            "women cloth": maze[301: 305]
        }

        return "".join(
            [
                arrow_marker(),
                background(),
                *map(partial(self._draw_square, start=solution.squares[0], current=solution.current), maze),
                Text("🟩", self._transform(maze[solution.current]).translate(
                    x=self.square_size // 2,
                    y=self.square_size // 2 + 8
                )).draw(
                    fill = "green",
                    font_size=f"{int(self.square_size)}px",
                    text_anchor="middle",
                    dominant_baseline="middle"
                ),
                *[self._draw_counter_label(name, squares, self.square_size, self.offset)
                for name, squares in counter_labels.items()],
                self._draw_solution(solution) if solution else ""
            ]
        )


    def _draw_square(self, square: Square, start, current) -> str:
        top_left: Point = self._transform(square)
        tags = []
        if square.role is Role.EXTERIOR:
            tags.append(exterior(top_left, self.square_size, self.line_width))
        elif square.role is Role.WALL:
            tags.append(wall(top_left, self.square_size, self.line_width))
        elif emoji := ROLE_EMOJI.get(square.role):
            tags.append(label(emoji, top_left, self.square_size // 2))
        elif square == start:
            emoji = "\N{pedestrian}"
            tags.append(label(emoji, top_left, self.square_size // 2))
        if square.index == current:
            emoji = "\N{white medium star}"
            tags.append(label(emoji, top_left, self.square_size // 2))
        tags.append(self._draw_border(square, top_left))
        return "".join(tags)

    def _draw_border(self, square: Square, top_left: Point) -> str:
        return decompose(square.border, top_left, self.square_size).draw(
            stroke_width=self.line_width, stroke="black", fill="none"
        )

    def _draw_solution(self, solution: Solution) -> str:
        return Polyline(
            [
                self._transform(point, self.square_size // 2)
                for point in solution
            ]
        ).draw(
            stroke_width=self.line_width * 2,
            stroke_opacity="50%",
            stroke="red",
            fill="none",
            marker_end="url(#arrow)",
        )

    def _transform(self, square: Square, extra_offset: int = 0) -> Point:
        return Point(
            x=square.column * self.square_size,
            y=square.row * self.square_size,
        ).translate(x=self.offset + extra_offset, y=self.offset + extra_offset)


def arrow_marker() -> str:
    return tag(
        "defs",
        tag(
            "marker",
            tag(
                "path",
                d="M 0,0 L 10,5 L 0,10 2,5 z",
                fill="red",
                fill_opacity="50%",
            ),
            id="arrow",
            viewBox="0 0 20 20",
            refX="2",
            refY="5",
            markerUnits="strokeWidth",
            markerWidth="10",
            markerHeight="10",
            orient="auto",
        ),
    )


def background() -> str:
    return Rect().draw(width="100%", height="100%", fill="white")


def exterior(top_left: Point, size: int, line_width: int) -> str:
    return Rect(top_left).draw(
        width=size,
        height=size,
        stroke_width=line_width,
        stroke="none",
        fill="white",
    )


def wall(top_left: Point, size: int, line_width: int) -> str:
    return Rect(top_left).draw(
        width=size,
        height=size,
        stroke_width=line_width,
        stroke="none",
        fill="lightgray",
    )


def label(emoji: str, top_left: Point, offset: int) -> str:
    return Text(emoji, top_left.translate(x=offset, y=offset)).draw(
        font_size=f"{offset}px",
        text_anchor="middle",
        dominant_baseline="middle",
    )
