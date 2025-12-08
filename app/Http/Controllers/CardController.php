<?php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\Request;

class CardController extends Controller
{
    /**
     * GET /cards
     * Lista todos os cards
     */
    public function index(Request $request)
    {
        $type = $request->query('type'); // media, category, actor, milestone, radio, social
        $categoryName = $request->query('category_name');
        
        $query = Card::query();
        
        if ($type) {
            $query->where('type', $type);
        }
        
        if ($categoryName) {
            // Buscar cards de categoria que correspondem ao nome
            $query->where('type', 'category')
                  ->where('name', 'like', "%{$categoryName}%");
        }
        
        $cards = $query->get();
        
        return response()->json($cards);
    }
    
    /**
     * GET /cards/by-category/{category_name}
     * Busca cards relacionados a uma categoria específica
     */
    public function byCategory($categoryName)
    {
        // Buscar cards de categoria que correspondem
        $categoryCards = Card::where('type', 'category')
            ->where(function ($query) use ($categoryName) {
                $query->where('name', 'like', "%{$categoryName}%")
                      ->orWhere('description', 'like', "%{$categoryName}%");
            })
            ->get();
        
        return response()->json($categoryCards);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Card $card)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Card $card)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Card $card)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Card $card)
    {
        //
    }
}
