import React, { useState, useEffect, useCallback } from "react";
import "./App.css"; // Mantenha os estilos no App.css ou use o CSS Module

// --- Tipagens ---
interface IItem {
  category: string;
  name: string;
  points: number;
  id: string;
  bonusItem: boolean;
  price: string;
  ratio?: number;
}
// --- Dados Iniciais ---
const initialItemsData: IItem[] = [
  // ITENS COM BÔNUS
  {
    category: "Pequenas Alegrias",
    name: "Pacote de Bolacha Recheada",
    points: 10,
    id: "bolacha",
    bonusItem: true,
    price: "",
  },
  {
    category: "Pequenas Alegrias",
    name: "Pacote de Wafer",
    points: 10,
    id: "wafer",
    bonusItem: true,
    price: "",
  },
  {
    category: "Pequenas Alegrias",
    name: "Pacote de Bala de Goma/Fini (min 80g)",
    points: 10,
    id: "goma",
    bonusItem: true,
    price: "",
  },
  // ITENS SEM BÔNUS
  {
    category: "Sabor de Festa",
    name: "Caixa de Bis ou Hershey's Mais",
    points: 25,
    id: "bis",
    bonusItem: false,
    price: "",
  },
  {
    category: "Sabor de Festa",
    name: "Barra de Chocolate (min 80g)",
    points: 25,
    id: "barraChoco",
    bonusItem: false,
    price: "",
  },
  {
    category: "Sabor de Festa",
    name: "Pacote de Cookies",
    points: 25,
    id: "cookies",
    bonusItem: false,
    price: "",
  },
  {
    category: "O Grande Pedido",
    name: "Caixa de Bombom",
    points: 50,
    id: "cxBombom",
    bonusItem: false,
    price: "",
  },
  {
    category: "Símbolo do Natal",
    name: "Panettone ou Chocotone (400g/500g)",
    points: 80,
    id: "panettone",
    bonusItem: true,
    price: "",
  },
  {
    category: "Kit Sonho Mágico",
    name: "Kit Completo (1 Panettone + 1 Cx Bombom + 2 Pct Bolacha)",
    points: 200,
    id: "kit",
    bonusItem: false,
    price: "",
  },
];

// --- Componente ItemRow ---
interface ItemRowProps {
  item: IItem;
  handlePriceChange: (id: string, newPrice: string) => void;
  isBestDeal: boolean;
  bonusActive: boolean;
}

const ItemRow: React.FC<ItemRowProps> = ({
  item,
  handlePriceChange,
  isBestDeal,
  bonusActive,
}) => {
  // Calcula pontos e bônus
  const currentPoints =
    item.bonusItem && bonusActive ? item.points * 2 : item.points;
  const isDoubled = item.bonusItem && bonusActive;
  const ratio = item.ratio || 0;

  return (
    <div className={`item-row ${isBestDeal ? "best-deal" : ""}`}>
      <label htmlFor={`price-${item.id}`}>{item.name}</label>
      <span className={`points ${isDoubled ? "doubled" : ""}`}>
        {currentPoints} pts {isDoubled && "(BÔNUS)"}
      </span>
      R$
      <input
        type="number"
        step="0.01"
        min="0"
        id={`price-${item.id}`}
        placeholder="0.00"
        value={item.price}
        // Evento tipado para input de formulário
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handlePriceChange(item.id, e.target.value)
        }
      />
      <span>
        <span className="result">{ratio.toFixed(2)}</span> Pts/R$
      </span>
      <span className="best-label">{isBestDeal && "✅ MELHOR NEGÓCIO!"}</span>
    </div>
  );
};

// --- Componente Principal App ---
const App: React.FC = () => {
  const [items, setItems] = useState<IItem[]>(initialItemsData);
  const [bonusActive, setBonusActive] = useState<boolean>(false);
  const [bestDealId, setBestDealId] = useState<string | null>(null);

  // Função de cálculo encapsulada em useCallback para otimização
  const calculateBestDeal = useCallback(
    (currentItems: IItem[], currentBonusActive: boolean) => {
      let bestRatio = -1;
      let newBestDealId: string | null = null;

      const updatedItems = currentItems.map((item) => {
        const price = parseFloat(item.price);
        const currentPoints =
          item.bonusItem && currentBonusActive ? item.points * 2 : item.points;
        let ratio = 0;

        if (price > 0 && !isNaN(price)) {
          ratio = currentPoints / price;
        }

        if (ratio > bestRatio) {
          bestRatio = ratio;
          newBestDealId = item.id;
        }
        return { ...item, ratio }; // Adiciona o ratio ao objeto item
      });

      setItems(updatedItems);
      setBestDealId(newBestDealId);
    },
    [],
  );

  // Efeito para recalcular quando itens ou bônus mudam
  useEffect(() => {
    calculateBestDeal(items, bonusActive);
  }, [items.map((i) => i.price).join(","), bonusActive, calculateBestDeal]);

  // Função para atualizar o preço
  const handlePriceChange = (id: string, newPrice: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, price: newPrice } : item,
      ),
    );
  };

  const toggleBonus = () => {
    setBonusActive((prev) => !prev);
  };

  // Agrupa os itens por categoria para exibição
  const groupedItems = items.reduce((acc: { [key: string]: IItem[] }, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Texto para o botão de bônus
  const bonusButtonText = bonusActive
    ? "🟢 Bônus ATIVO (Itens de 10 pts: 20 pts | Panettone: 160 pts)"
    : "🔴 Ativar Bônus (Bolacha Recheada, Wafer, Bala de Goma e Panettone/Chocotone)";

  return (
    <div className="container">
      <h1>💰 Calculadora de Pontos por Custo (TypeScript)</h1>
      <p>
        Insira o preço de cada item e veja qual oferece o melhor custo-benefício
        (Pts/R$).
      </p>

      <div className="controls">
        {/* O evento de clique é tipado automaticamente pelo React.FC */}
        <button
          id="bonusButton"
          onClick={toggleBonus}
          className={bonusActive ? "active" : ""}
        >
          {bonusButtonText}
        </button>
      </div>

      <div id="calculator">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          // React.Fragment é usado para evitar chaves desnecessárias
          <React.Fragment key={category}>
            <div className="category-header">{category}</div>
            {categoryItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                handlePriceChange={handlePriceChange}
                isBestDeal={item.id === bestDealId}
                bonusActive={bonusActive}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default App;
