import networkx as nx
from itertools import permutations

from maze_solver.graphs.converter import make_graph
from maze_solver.models.maze import Maze
from maze_solver.models.solution import Solution


def solve(maze: Maze, squares, count, positions) -> Solution | None:
    if len(squares) < 2:
        raise ValueError("At least two squares are required")

    graph = make_graph(maze)

    # Precompute all pairwise shortest paths + costs between squares
    pairs = []
    nodes = squares
    for i in range(len(nodes)):
        for j in range(len(nodes)):
            if i != j:
                pairs.append((nodes[i], nodes[j]))

    path_cache = {}
    for u, v in pairs:
        try:
            path = nx.shortest_path(graph, source=u, target=v, weight="weight")
            cost = nx.shortest_path_length(graph, source=u, target=v, weight="weight")
            path_cache[(u, v)] = (path, cost)
        except nx.NetworkXException:
            # No path between u and v
            path_cache[(u, v)] = None

    start = squares[0]
    waypoints = squares[1:-1] if len(squares) > 2 else []
    end = squares[-1]

    best_tour = None
    best_cost = float("inf")
    final_pos = None

    for permutation in permutations(list(zip(waypoints, positions))):
        perm = [permutation[i][0] for i in range(len(permutation))]
        pos = [permutation[i][1] for i in range(len(permutation))]

        tour = [start] + list(perm) + [end]
        total_cost = 0
        valid = True

        for i in range(len(tour) - 1):
            key = (tour[i], tour[i + 1])
            result = path_cache.get(key)
            if result is None:
                valid = False
                break
            partial, cost = result
            total_cost += cost

        if valid and total_cost < best_cost:
            best_cost = total_cost
            best_tour = tour
            final_pos = pos

    best_tour = best_tour[count:]
    best_path = []
    for i in range(len(best_tour) - 1):
        key = (best_tour[i], best_tour[i + 1])
        result = path_cache.get(key)
        if result is None:
            valid = False
            break
        partial, cost = result
        if i==0:
            best_path.extend(partial)
        else:
            best_path.extend(partial[1:])

    final_pos.append(('EXIT', 136))
    print(final_pos)
    if best_path:
        return Solution(squares=tuple(best_path), current = final_pos[count][1]), final_pos[count][0]
    else:
        return None
