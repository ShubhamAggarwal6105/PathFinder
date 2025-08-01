from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from maze_solver.models.border import Border
from maze_solver.models.maze import Maze
from maze_solver.models.role import Role
from maze_solver.graphs.solver import solve
from maze_solver.models.square import Square
from maze_solver.view.renderer import SVGRenderer

@csrf_exempt
@require_http_methods(["POST"])
def generate_path(request):
    try:
        data = json.loads(request.body)
        items = data.get('items', [])
        collected_count = data.get('collectedCount', 0)
        
        # items = [{'id': 'pulses-1', 'name': 'All-purpose Flour (2 lbs)', 'quantity': 1}, {'id': 'spices-2', 'name': 'Granulated Sugar (1kg)', 'quantity': 1}, {'id': 'dairy-1', 'name': 'Eggs (1 dozen) ', 'quantity': 1}, {'id': 'dairy-4', 'name': 'Organic Butter (1 lb)', 'quantity': 1}, {'id': 'snacks-7', 'name': "Hershey's Milk Chocolate", 'quantity': 1}, {'id': 'packaged-5', 'name': 'Great Value baking powder ', 'quantity': 1}, {'id': 'canned-2', 'name': 'Watkins Vanilla Extract', 'quantity': 1}, {'id': 'spices-1', 'name': 'Himalayan Table salt (1kg)', 'quantity': 1}]

        # item_map = {"snacks-7": 146, "packaged-5": 111, "dairy-4": 80, "dairy-1": 78, "spices-2": 74, "spices-1": 71, "pulses-1": 107, "canned-2": 106}
        # position_map = {"snacks-7": 163, "packaged-5": 128, "dairy-4": 63, "dairy-1": 61, "spices-2": 57, "spices-1": 54, "pulses-1": 90, "canned-2": 123}

        # Hard-coded position_map: maps each product ID to its fixed square index
        position_map: Dict[str, int] = {
            # Snacks
            "snacks-1": 162, "snacks-2": 163, "snacks-3": 164, "snacks-4": 165,
            "snacks-5": 162, "snacks-6": 163, "snacks-7": 164, "snacks-8": 165,
            # Fruits & Vegetables
            "fruits-1": 191, "fruits-2": 192, "fruits-3": 193, "fruits-4": 194,
            "fruits-5": 195, "fruits-6": 196, "fruits-7": 197, "fruits-8": 198,
            # Beverages
            "beverages-1": 157, "beverages-2": 158, "beverages-3": 159, "beverages-4": 160,
            # Packaged Food
            "packaged-1": 128, "packaged-2": 129, "packaged-3": 130, "packaged-4": 131,
            "packaged-5": 128, "packaged-6": 129, "packaged-7": 130, "packaged-8": 131,
            # Canned Food
            "canned-1": 123, "canned-2": 124, "canned-3": 125, "canned-4": 126,
            # Pulses & Grains
            "pulses-1": 89, "pulses-2": 90, "pulses-3": 91, "pulses-4": 92,
            # Dairy
            "dairy-1": 60, "dairy-2": 61, "dairy-3": 62, "dairy-4": 63,
            # Spices
            "spices-1": 52, "spices-2": 53, "spices-3": 54, "spices-4": 55,
            # Meat
            "meat-1": 27, "meat-2": 28, "meat-3": 29, "meat-4": 30,
            # Frozen Food
            "frozen-1": 18, "frozen-2": 19, "frozen-3": 20, "frozen-4": 21,
            # Household
            "household-1": 222, "household-2": 223, "household-3": 224, "household-4": 225,
            # Stationary
            "stationary-1": 230, "stationary-2": 231, "stationary-3": 232, "stationary-4": 233,
            # Electronics
            "electronics-1": 257, "electronics-2": 258, "electronics-3": 259, "electronics-4": 260,
            # Footwear
            "footwear-1": 264, "footwear-2": 265, "footwear-3": 266, "footwear-4": 267,
            # Men Clothes
            "men-clothes-1": 290, "men-clothes-2": 291, "men-clothes-3": 292, "men-clothes-4": 293,
            # Kids Clothes
            "kids-clothes-1": 295, "kids-clothes-2": 296, "kids-clothes-3": 297, "kids-clothes-4": 298,
            # Women Clothes
            "women-clothes-1": 301, "women-clothes-2": 302, "women-clothes-3": 303, "women-clothes-4": 304,
        }

        # Hard-coded item_map: each product placed in the cell above its position_map entry
        item_map: Dict[str, int] = {
            # Snacks
            "snacks-1": 162+17, "snacks-2": 163+17, "snacks-3": 164+17, "snacks-4": 165+17,
            "snacks-5": 162-17, "snacks-6": 163-17, "snacks-7": 164-17, "snacks-8": 165-17,
            # Fruits & Vegetables
            "fruits-1": 191-17, "fruits-2": 192-17, "fruits-3": 193-17, "fruits-4": 194-17,
            "fruits-5": 195-17, "fruits-6": 196-17, "fruits-7": 197-17, "fruits-8": 198-17,
            # Beverages
            "beverages-1": 157+17, "beverages-2": 158+17, "beverages-3": 159+17, "beverages-4": 160+17,
            # Packaged Food
            "packaged-1": 128-17, "packaged-2": 129-17, "packaged-3": 130-17, "packaged-4": 131-17,
            "packaged-5": 128+17, "packaged-6": 129+17, "packaged-7": 130+17, "packaged-8": 131+17,
            # Canned Food
            "canned-1": 123+17, "canned-2": 124+17, "canned-3": 125+17, "canned-4": 126+17,
            # Pulses & Grains
            "pulses-1": 89+17, "pulses-2": 90+17, "pulses-3": 91+17, "pulses-4": 92+17,
            # Dairy
            "dairy-1": 60+17, "dairy-2": 61+17, "dairy-3": 62+17, "dairy-4": 63+17,
            # Spices
            "spices-1": 52+17, "spices-2": 53+17, "spices-3": 54+17, "spices-4": 55+17,
            # Meat
            "meat-1": 27-17, "meat-2": 28-17, "meat-3": 29-17, "meat-4": 30-17,
            # Frozen Food
            "frozen-1": 18-17, "frozen-2": 19-17, "frozen-3": 20-17, "frozen-4": 21-17,
            # Household
            "household-1": 222-17, "household-2": 223-17, "household-3": 224-17, "household-4": 225-17,
            # Stationary
            "stationary-1": 230-17, "stationary-2": 231-17, "stationary-3": 232-17, "stationary-4": 233-17,
            # Electronics
            "electronics-1": 257-17, "electronics-2": 258-17, "electronics-3": 259-17, "electronics-4": 260-17,
            # Footwear
            "footwear-1": 264-17, "footwear-2": 265-17, "footwear-3": 266-17, "footwear-4": 267-17,
            # Men Clothes
            "men-clothes-1": 290-17, "men-clothes-2": 291-17, "men-clothes-3": 292-17, "men-clothes-4": 293-17,
            # Kids Clothes
            "kids-clothes-1": 295-17, "kids-clothes-2": 296-17, "kids-clothes-3": 297-17, "kids-clothes-4": 298-17,
            # Women Clothes
            "women-clothes-1": 301-17, "women-clothes-2": 302-17, "women-clothes-3": 303-17, "women-clothes-4": 304-17,
        }

        # Create the exact same maze from tutorial.py
        maze = Maze(
            squares=(
                Square(index=0, row=0, column=0, border=Border.TOP | Border.LEFT),
                Square(index=1, row=0, column=1, border=Border.TOP | Border.BOTTOM),
                Square(index=2, row=0, column=2, border=Border.TOP | Border.BOTTOM),
                Square(index=3, row=0, column=3, border=Border.TOP),
                Square(index=4, row=0, column=4, border=Border.TOP | Border.BOTTOM),
                Square(index=5, row=0, column=5, border=Border.TOP | Border.BOTTOM),
                Square(index=6, row=0, column=6, border=Border.TOP | Border.BOTTOM),
                Square(index=7, row=0, column=7, border=Border.TOP | Border.RIGHT),
                Square(index=8, row=0, column=8, border=Border.LEFT | Border.RIGHT, role=Role.EXTERIOR),
                Square(index=9, row=0, column=9, border=Border.TOP | Border.LEFT),
                Square(index=10, row=0, column=10, border=Border.TOP | Border.BOTTOM),
                Square(index=11, row=0, column=11, border=Border.TOP | Border.BOTTOM),
                Square(index=12, row=0, column=12, border=Border.TOP | Border.BOTTOM),
                Square(index=13, row=0, column=13, border=Border.TOP),
                Square(index=14, row=0, column=14, border=Border.TOP | Border.BOTTOM),
                Square(index=15, row=0, column=15, border=Border.TOP | Border.BOTTOM),
                Square(index=16, row=0, column=16, border=Border.TOP | Border.RIGHT),
                Square(index=17, row=1, column=0, border=Border.LEFT | Border.RIGHT),
                Square(index=18, row=1, column=1, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=19, row=1, column=2, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=20, row=1, column=3, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=21, row=1, column=4, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=22, row=1, column=5, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=23, row=1, column=6, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=24, row=1, column=7, border=Border.LEFT | Border.RIGHT),
                Square(index=25, row=1, column=8, border=Border.BOTTOM | Border.LEFT | Border.RIGHT, role=Role.EXTERIOR),
                Square(index=26, row=1, column=9, border=Border.LEFT | Border.RIGHT),
                Square(index=27, row=1, column=10, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=28, row=1, column=11, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=29, row=1, column=12, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=30, row=1, column=13, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=31, row=1, column=14, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=32, row=1, column=15, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=33, row=1, column=16, border=Border.LEFT | Border.RIGHT),
                Square(index=34, row=2, column=0, border=Border.LEFT),
                Square(index=35, row=2, column=1, border=Border.TOP | Border.BOTTOM),
                Square(index=36, row=2, column=2, border=Border.TOP | Border.BOTTOM),
                Square(index=37, row=2, column=3, border=Border.EMPTY),
                Square(index=38, row=2, column=4, border=Border.TOP | Border.BOTTOM),
                Square(index=39, row=2, column=5, border=Border.TOP),
                Square(index=40, row=2, column=6, border=Border.TOP | Border.BOTTOM),
                Square(index=41, row=2, column=7, border=Border.BOTTOM),
                Square(index=42, row=2, column=8, border=Border.TOP),
                Square(index=43, row=2, column=9, border=Border.BOTTOM),
                Square(index=44, row=2, column=10, border=Border.TOP | Border.BOTTOM),
                Square(index=45, row=2, column=11, border=Border.TOP),
                Square(index=46, row=2, column=12, border=Border.TOP | Border.BOTTOM),
                Square(index=47, row=2, column=13, border=Border.EMPTY),
                Square(index=48, row=2, column=14, border=Border.TOP | Border.BOTTOM),
                Square(index=49, row=2, column=15, border=Border.TOP | Border.BOTTOM),
                Square(index=50, row=2, column=16, border=Border.RIGHT),
                Square(index=51, row=3, column=0, border=Border.LEFT | Border.RIGHT),
                Square(index=52, row=3, column=1, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=53, row=3, column=2, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=54, row=3, column=3, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=55, row=3, column=4, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=56, row=3, column=5, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=57, row=3, column=6, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=58, row=3, column=7, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=59, row=3, column=8, border=Border.LEFT | Border.RIGHT),
                Square(index=60, row=3, column=9, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=61, row=3, column=10, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=62, row=3, column=11, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=63, row=3, column=12, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=64, row=3, column=13, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=65, row=3, column=14, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=66, row=3, column=15, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=67, row=3, column=16, border=Border.LEFT | Border.RIGHT),
                Square(index=68, row=4, column=0, border=Border.BOTTOM | Border.LEFT),
                Square(index=69, row=4, column=1, border=Border.TOP | Border.BOTTOM),
                Square(index=70, row=4, column=2, border=Border.TOP | Border.BOTTOM),
                Square(index=71, row=4, column=3, border=Border.TOP),
                Square(index=72, row=4, column=4, border=Border.TOP | Border.BOTTOM),
                Square(index=73, row=4, column=5, border=Border.TOP | Border.BOTTOM),
                Square(index=74, row=4, column=6, border=Border.TOP | Border.BOTTOM),
                Square(index=75, row=4, column=7, border=Border.TOP | Border.BOTTOM),
                Square(index=76, row=4, column=8, border=Border.BOTTOM),
                Square(index=77, row=4, column=9, border=Border.TOP | Border.BOTTOM),
                Square(index=78, row=4, column=10, border=Border.TOP | Border.BOTTOM),
                Square(index=79, row=4, column=11, border=Border.TOP | Border.BOTTOM),
                Square(index=80, row=4, column=12, border=Border.TOP | Border.BOTTOM),
                Square(index=81, row=4, column=13, border=Border.TOP),
                Square(index=82, row=4, column=14, border=Border.TOP | Border.BOTTOM),
                Square(index=83, row=4, column=15, border=Border.TOP | Border.BOTTOM),
                Square(index=84, row=4, column=16, border=Border.BOTTOM | Border.RIGHT),
                Square(index=85, row=5, column=0, border=Border.TOP, role=Role.EXTERIOR),
                Square(index=86, row=5, column=1, border=Border.TOP, role=Role.EXTERIOR),
                Square(index=87, row=5, column=2, border=Border.TOP | Border.RIGHT, role=Role.EXTERIOR),
                Square(index=88, row=5, column=3, border=Border.LEFT | Border.RIGHT),
                Square(index=89, row=5, column=4, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=90, row=5, column=5, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=91, row=5, column=6, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=92, row=5, column=7, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=93, row=5, column=8, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=94, row=5, column=9, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=95, row=5, column=10, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=96, row=5, column=11, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=97, row=5, column=12, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=98, row=5, column=13, border=Border.LEFT | Border.RIGHT),
                Square(index=99, row=5, column=14, border=Border.TOP | Border.LEFT, role=Role.EXTERIOR),
                Square(index=100, row=5, column=15, border=Border.TOP, role=Role.EXTERIOR),
                Square(index=101, row=5, column=16, border=Border.TOP, role=Role.EXTERIOR),
                Square(index=102, row=6, column=0, border=Border.EMPTY, role=Role.EXTERIOR),
                Square(index=103, row=6, column=1, border=Border.EMPTY, role=Role.EXTERIOR),
                Square(index=104, row=6, column=2, border=Border.RIGHT, role=Role.EXTERIOR),
                Square(index=105, row=6, column=3, border=Border.LEFT),
                Square(index=106, row=6, column=4, border=Border.TOP | Border.BOTTOM),
                Square(index=107, row=6, column=5, border=Border.TOP | Border.BOTTOM),
                Square(index=108, row=6, column=6, border=Border.TOP | Border.BOTTOM),
                Square(index=109, row=6, column=7, border=Border.TOP | Border.BOTTOM),
                Square(index=110, row=6, column=8, border=Border.TOP),
                Square(index=111, row=6, column=9, border=Border.TOP | Border.BOTTOM),
                Square(index=112, row=6, column=10, border=Border.TOP | Border.BOTTOM),
                Square(index=113, row=6, column=11, border=Border.TOP | Border.BOTTOM),
                Square(index=114, row=6, column=12, border=Border.TOP | Border.BOTTOM),
                Square(index=115, row=6, column=13, border=Border.RIGHT),
                Square(index=116, row=6, column=14, border=Border.LEFT, role=Role.EXTERIOR),
                Square(index=117, row=6, column=15, border=Border.EMPTY, role=Role.EXTERIOR),
                Square(index=118, row=6, column=16, border=Border.EMPTY, role=Role.EXTERIOR),
                Square(index=119, row=7, column=0, border=Border.BOTTOM, role=Role.EXTERIOR),
                Square(index=120, row=7, column=1, border=Border.BOTTOM, role=Role.EXTERIOR),
                Square(index=121, row=7, column=2, border=Border.BOTTOM | Border.RIGHT, role=Role.EXTERIOR),
                Square(index=122, row=7, column=3, border=Border.LEFT | Border.RIGHT),
                Square(index=123, row=7, column=4, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=124, row=7, column=5, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=125, row=7, column=6,  border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=126, row=7, column=7, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=127, row=7, column=8, border=Border.LEFT | Border.RIGHT),
                Square(index=128, row=7, column=9, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=129, row=7, column=10, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=130, row=7, column=11, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=131, row=7, column=12, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=132, row=7, column=13, border=Border.LEFT | Border.RIGHT),
                Square(index=133, row=7, column=14, border=Border.BOTTOM | Border.LEFT, role=Role.EXTERIOR),
                Square(index=134, row=7, column=15, border=Border.BOTTOM, role=Role.EXTERIOR),
                Square(index=135, row=7, column=16, border=Border.BOTTOM, role=Role.EXTERIOR),
                Square(index=136, row=8, column=0, border=Border.TOP | Border.BOTTOM, role=Role.EXIT),
                Square(index=137, row=8, column=1, border=Border.TOP | Border.BOTTOM),
                Square(index=138, row=8, column=2, border=Border.TOP | Border.BOTTOM),
                Square(index=139, row=8, column=3, border=Border.EMPTY),
                Square(index=140, row=8, column=4, border=Border.TOP | Border.BOTTOM),
                Square(index=141, row=8, column=5, border=Border.TOP | Border.BOTTOM),
                Square(index=142, row=8, column=6, border=Border.TOP | Border.BOTTOM),
                Square(index=143, row=8, column=7, border=Border.TOP | Border.BOTTOM),
                Square(index=144, row=8, column=8, border=Border.EMPTY),
                Square(index=145, row=8, column=9, border=Border.TOP | Border.BOTTOM),
                Square(index=146, row=8, column=10, border=Border.TOP | Border.BOTTOM),
                Square(index=147, row=8, column=11, border=Border.TOP | Border.BOTTOM),
                Square(index=148, row=8, column=12, border=Border.TOP | Border.BOTTOM),
                Square(index=149, row=8, column=13, border=Border.EMPTY),
                Square(index=150, row=8, column=14, border=Border.TOP | Border.BOTTOM),
                Square(index=151, row=8, column=15, border=Border.TOP | Border.BOTTOM),
                Square(index=152, row=8, column=16, border=Border.TOP | Border.BOTTOM, role=Role.ENTRANCE),
                Square(index=153, row=9, column=0, border=Border.TOP, role=Role.EXTERIOR),
                Square(index=154, row=9, column=1, border=Border.TOP, role=Role.EXTERIOR),
                Square(index=155, row=9, column=2, border=Border.TOP | Border.RIGHT, role=Role.EXTERIOR),
                Square(index=156, row=9, column=3, border=Border.LEFT | Border.RIGHT),
                Square(index=157, row=9, column=4, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=158, row=9, column=5, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=159, row=9, column=6,  border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=160, row=9, column=7, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=161, row=9, column=8, border=Border.LEFT | Border.RIGHT),
                Square(index=162, row=9, column=9, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=163, row=9, column=10, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=164, row=9, column=11, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=165, row=9, column=12, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=166, row=9, column=13, border=Border.LEFT | Border.RIGHT),
                Square(index=167, row=9, column=14, border=Border.TOP | Border.LEFT, role=Role.EXTERIOR),
                Square(index=168, row=9, column=15, border=Border.TOP, role=Role.EXTERIOR),
                Square(index=169, row=9, column=16, border=Border.TOP, role=Role.EXTERIOR),
                Square(index=170, row=10, column=0, border=Border.EMPTY, role=Role.EXTERIOR),
                Square(index=171, row=10, column=1, border=Border.EMPTY, role=Role.EXTERIOR),
                Square(index=172, row=10, column=2, border=Border.RIGHT, role=Role.EXTERIOR),
                Square(index=173, row=10, column=3, border=Border.LEFT),
                Square(index=174, row=10, column=4, border=Border.TOP | Border.BOTTOM),
                Square(index=175, row=10, column=5, border=Border.TOP | Border.BOTTOM),
                Square(index=176, row=10, column=6, border=Border.TOP | Border.BOTTOM),
                Square(index=177, row=10, column=7, border=Border.TOP | Border.BOTTOM),
                Square(index=178, row=10, column=8, border=Border.BOTTOM),
                Square(index=179, row=10, column=9, border=Border.TOP | Border.BOTTOM),
                Square(index=180, row=10, column=10, border=Border.TOP | Border.BOTTOM),
                Square(index=181, row=10, column=11, border=Border.TOP | Border.BOTTOM),
                Square(index=182, row=10, column=12, border=Border.TOP | Border.BOTTOM),
                Square(index=183, row=10, column=13, border=Border.RIGHT),
                Square(index=184, row=10, column=14, border=Border.LEFT, role=Role.EXTERIOR),
                Square(index=185, row=10, column=15, border=Border.EMPTY, role=Role.EXTERIOR),
                Square(index=186, row=10, column=16, border=Border.EMPTY, role=Role.EXTERIOR),
                Square(index=187, row=11, column=0, border=Border.BOTTOM, role=Role.EXTERIOR),
                Square(index=188, row=11, column=1, border=Border.BOTTOM, role=Role.EXTERIOR),
                Square(index=189, row=11, column=2, border=Border.BOTTOM | Border.RIGHT, role=Role.EXTERIOR),
                Square(index=190, row=11, column=3, border=Border.LEFT | Border.RIGHT),
                Square(index=191, row=11, column=4, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=192, row=11, column=5, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=193, row=11, column=6, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=194, row=11, column=7, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=195, row=11, column=8, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=196, row=11, column=9, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=197, row=11, column=10, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=198, row=11, column=11, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=199, row=11, column=12, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=200, row=11, column=13, border=Border.LEFT | Border.RIGHT),
                Square(index=201, row=11, column=14, border=Border.BOTTOM | Border.LEFT, role=Role.EXTERIOR),
                Square(index=202, row=11, column=15, border=Border.BOTTOM, role=Role.EXTERIOR),
                Square(index=203, row=11, column=16, border=Border.BOTTOM, role=Role.EXTERIOR),
                Square(index=204, row=12, column=0, border=Border.TOP | Border.LEFT),
                Square(index=205, row=12, column=1, border=Border.BOTTOM | Border.TOP),
                Square(index=206, row=12, column=2, border=Border.BOTTOM | Border.TOP),
                Square(index=207, row=12, column=3, border=Border.BOTTOM),
                Square(index=208, row=12, column=4, border=Border.BOTTOM | Border.TOP),
                Square(index=209, row=12, column=5, border=Border.BOTTOM | Border.TOP),
                Square(index=210, row=12, column=6, border=Border.BOTTOM | Border.TOP),
                Square(index=211, row=12, column=7, border=Border.BOTTOM | Border.TOP),
                Square(index=212, row=12, column=8, border=Border.TOP),
                Square(index=213, row=12, column=9, border=Border.BOTTOM | Border.TOP),
                Square(index=214, row=12, column=10, border=Border.BOTTOM | Border.TOP),
                Square(index=215, row=12, column=11, border=Border.BOTTOM | Border.TOP),
                Square(index=216, row=12, column=12, border=Border.BOTTOM | Border.TOP),
                Square(index=217, row=12, column=13, border=Border.BOTTOM),
                Square(index=218, row=12, column=14, border=Border.BOTTOM | Border.TOP),
                Square(index=219, row=12, column=15, border=Border.BOTTOM | Border.TOP),
                Square(index=220, row=12, column=16, border=Border.TOP | Border.RIGHT),
                Square(index=221, row=13, column=0, border=Border.LEFT | Border.RIGHT),
                Square(index=222, row=13, column=1, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=223, row=13, column=2, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=224, row=13, column=3, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=225, row=13, column=4, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=226, row=13, column=5, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=227, row=13, column=6, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=228, row=13, column=7, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=229, row=13, column=8, border=Border.LEFT | Border.RIGHT),
                Square(index=230, row=13, column=9, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=231, row=13, column=10, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=232, row=13, column=11, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=233, row=13, column=12, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=234, row=13, column=13, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=235, row=13, column=14, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=236, row=13, column=15, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=237, row=13, column=16, border=Border.LEFT | Border.RIGHT),
                Square(index=238, row=14, column=0, border=Border.BOTTOM | Border.LEFT),
                Square(index=239, row=14, column=1, border=Border.TOP),
                Square(index=240, row=14, column=2, border=Border.TOP | Border.BOTTOM),
                Square(index=241, row=14, column=3, border=Border.TOP | Border.BOTTOM),
                Square(index=242, row=14, column=4, border=Border.TOP | Border.BOTTOM),
                Square(index=243, row=14, column=5, border=Border.TOP | Border.BOTTOM),
                Square(index=244, row=14, column=6, border=Border.TOP | Border.BOTTOM),
                Square(index=245, row=14, column=7, border=Border.TOP | Border.BOTTOM),
                Square(index=246, row=14, column=8),
                Square(index=247, row=14, column=9, border=Border.TOP | Border.BOTTOM),
                Square(index=248, row=14, column=10, border=Border.TOP | Border.BOTTOM),
                Square(index=249, row=14, column=11, border=Border.TOP | Border.BOTTOM),
                Square(index=250, row=14, column=12, border=Border.TOP | Border.BOTTOM),
                Square(index=251, row=14, column=13, border=Border.TOP | Border.BOTTOM),
                Square(index=252, row=14, column=14, border=Border.TOP | Border.BOTTOM),
                Square(index=253, row=14, column=15, border=Border.TOP),
                Square(index=254, row=14, column=16, border=Border.BOTTOM | Border.RIGHT),
                Square(index=255, row=15, column=0, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.EXTERIOR),
                Square(index=256, row=15, column=1, border=Border.LEFT | Border.RIGHT),
                Square(index=257, row=15, column=2, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=258, row=15, column=3, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=259, row=15, column=4, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=260, row=15, column=5, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=261, row=15, column=6, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=262, row=15, column=7, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=263, row=15, column=8, border=Border.LEFT | Border.RIGHT),
                Square(index=264, row=15, column=9, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=265, row=15, column=10, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=266, row=15, column=11, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=267, row=15, column=12, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=268, row=15, column=13, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=269, row=15, column=14, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=270, row=15, column=15, border=Border.LEFT | Border.RIGHT),
                Square(index=271, row=15, column=16, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.EXTERIOR),
                Square(index=272, row=16, column=0, border=Border.TOP | Border.LEFT),
                Square(index=273, row=16, column=1, border=Border.BOTTOM),
                Square(index=274, row=16, column=2, border=Border.TOP | Border.BOTTOM),
                Square(index=275, row=16, column=3, border=Border.TOP | Border.BOTTOM),
                Square(index=276, row=16, column=4, border=Border.TOP | Border.BOTTOM),
                Square(index=277, row=16, column=5, border=Border.TOP),
                Square(index=278, row=16, column=6, border=Border.TOP | Border.BOTTOM),
                Square(index=279, row=16, column=7, border=Border.TOP | Border.BOTTOM),
                Square(index=280, row=16, column=8, border=Border.BOTTOM),
                Square(index=281, row=16, column=9, border=Border.TOP | Border.BOTTOM),
                Square(index=282, row=16, column=10, border=Border.TOP | Border.BOTTOM),
                Square(index=283, row=16, column=11, border=Border.TOP),
                Square(index=284, row=16, column=12, border=Border.TOP | Border.BOTTOM),
                Square(index=285, row=16, column=13, border=Border.TOP | Border.BOTTOM),
                Square(index=286, row=16, column=14, border=Border.TOP | Border.BOTTOM),
                Square(index=287, row=16, column=15, border=Border.BOTTOM),
                Square(index=288, row=16, column=16, border=Border.TOP | Border.RIGHT),
                Square(index=289, row=17, column=0, border=Border.LEFT | Border.RIGHT),
                Square(index=290, row=17, column=1, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=291, row=17, column=2, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=292, row=17, column=3, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=293, row=17, column=4, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=294, row=17, column=5, border=Border.LEFT | Border.RIGHT),
                Square(index=295, row=17, column=6, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=296, row=17, column=7, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=297, row=17, column=8, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=298, row=17, column=9, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=299, row=17, column=10, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=300, row=17, column=11, border=Border.LEFT | Border.RIGHT),
                Square(index=301, row=17, column=12, border=Border.TOP | Border.BOTTOM | Border.LEFT, role=Role.WALL),
                Square(index=302, row=17, column=13, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=303, row=17, column=14, border=Border.TOP | Border.BOTTOM, role=Role.WALL),
                Square(index=304, row=17, column=15, border=Border.TOP | Border.BOTTOM | Border.RIGHT, role=Role.WALL),
                Square(index=305, row=17, column=16, border=Border.LEFT | Border.RIGHT),
                Square(index=306, row=18, column=0, border=Border.BOTTOM | Border.LEFT),
                Square(index=307, row=18, column=1, border=Border.TOP | Border.BOTTOM),
                Square(index=308, row=18, column=2, border=Border.TOP | Border.BOTTOM),
                Square(index=309, row=18, column=3, border=Border.TOP | Border.BOTTOM),
                Square(index=310, row=18, column=4, border=Border.TOP | Border.BOTTOM),
                Square(index=311, row=18, column=5, border=Border.BOTTOM),
                Square(index=312, row=18, column=6, border=Border.TOP | Border.BOTTOM),
                Square(index=313, row=18, column=7, border=Border.TOP | Border.BOTTOM),
                Square(index=314, row=18, column=8, border=Border.TOP | Border.BOTTOM),
                Square(index=315, row=18, column=9, border=Border.TOP | Border.BOTTOM),
                Square(index=316, row=18, column=10, border=Border.TOP | Border.BOTTOM),
                Square(index=317, row=18, column=11, border=Border.BOTTOM),
                Square(index=318, row=18, column=12, border=Border.TOP | Border.BOTTOM),
                Square(index=319, row=18, column=13, border=Border.TOP | Border.BOTTOM),
                Square(index=320, row=18, column=14, border=Border.TOP | Border.BOTTOM),
                Square(index=321, row=18, column=15, border=Border.TOP | Border.BOTTOM),
                Square(index=322, row=18, column=16, border=Border.BOTTOM | Border.RIGHT),
            )
        )
        
        # Create solution path
        solution, collectItem = solve(maze, squares=[maze[152]] + [maze[item_map[item['id']]] for item in items] + [maze[136]], count = collected_count, positions = [(item['name'], position_map[item['id']]) for item in items])

        # Generate SVG
        renderer = SVGRenderer()
        svg_content = renderer.render(maze, solution).xml_content
        
        # Resize the SVG to fit window better
        svg_content = svg_content.replace('width="680"', 'width="100%"')
        svg_content = svg_content.replace('height="760"', 'height="auto"')
        svg_content = svg_content.replace('<svg', '<svg style="max-width: 800px; max-height: 600px;"')
        
        return JsonResponse({
            'success': True,
            'svg': svg_content,
            'items_count': len(items),
            'collectedCount': collected_count,
            'collectItem': collectItem
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'collectedCount': collected_count if 'collected_count' in locals() else 0,
            'collectItem': collectItem if 'collectItem' in locals() else ''
        }, status=500)
