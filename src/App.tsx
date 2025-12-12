import React, { useState, useEffect, useCallback } from "react";
import "./App.css"; // Mantenha os estilos no App.css

// --- Tipagens ---
interface IItem {
  category: string;
  name: string;
  points: number;
  id: string;
  bonusItem: boolean;
  price: string;
  quantity: number; // NOVO: Quantidade comprada
  totalPoints?: number; // NOVO: Pontos do item * Quantidade
  ratio?: number;
}
// --- Dados Iniciais ---
const initialItemsData: IItem[] = [
  {
    category: "Pequenas Alegrias",
    name: "Pacote de Bolacha Recheada",
    points: 10,
    id: "bolacha",
    bonusItem: true,
    price: "",
    quantity: 0,
  },
  {
    category: "Pequenas Alegrias",
    name: "Pacote de Wafer",
    points: 10,
    id: "wafer",
    bonusItem: true,
    price: "",
    quantity: 0,
  },
  {
    category: "Pequenas Alegrias",
    name: "Pacote de Bala de Goma/Fini (min 80g)",
    points: 10,
    id: "goma",
    bonusItem: true,
    price: "",
    quantity: 0,
  },
  {
    category: "Sabor de Festa",
    name: "Caixa de Bis ou Hershey's Mais",
    points: 25,
    id: "bis",
    bonusItem: false,
    price: "",
    quantity: 0,
  },
  {
    category: "Sabor de Festa",
    name: "Barra de Chocolate (min 80g)",
    points: 25,
    id: "barraChoco",
    bonusItem: false,
    price: "",
    quantity: 0,
  },
  {
    category: "Sabor de Festa",
    name: "Pacote de Cookies",
    points: 25,
    id: "cookies",
    bonusItem: false,
    price: "",
    quantity: 0,
  },
  {
    category: "O Grande Pedido",
    name: "Caixa de Bombom",
    points: 50,
    id: "cxBombom",
    bonusItem: false,
    price: "",
    quantity: 0,
  },
  {
    category: "Símbolo do Natal",
    name: "Panettone ou Chocotone (400g/500g)",
    points: 80,
    id: "panettone",
    bonusItem: true,
    price: "",
    quantity: 0,
  },
  {
    category: "Kit Sonho Mágico",
    name: "Kit Completo (1 Panettone + 1 Cx Bombom + 2 Pct Bolacha)",
    points: 200,
    id: "kit",
    bonusItem: false,
    price: "",
    quantity: 0,
  },
];

// --- Componente ItemRow ---
interface ItemRowProps {
  item: IItem;
  handlePriceChange: (id: string, newPrice: string) => void;
  handleQuantityChange: (id: string, newQuantity: number) => void; // NOVO prop
  isBestDeal: boolean;
  bonusActive: boolean;
}

const ItemRow: React.FC<ItemRowProps> = ({
  item,
  handlePriceChange,
  handleQuantityChange,
  isBestDeal,
  bonusActive,
}) => {
  const currentPoints =
    item.bonusItem && bonusActive ? item.points * 2 : item.points;
  const isDoubled = item.bonusItem && bonusActive;
  const ratio = item.ratio || 0;
  const totalPoints = item.totalPoints || 0; // Pega o totalPoints calculado

  return (
    <div className={`item-row ${isBestDeal ? "best-deal" : ""}`}>
      <div className="item-name-col">
        <label htmlFor={`price-${item.id}`}>{item.name}</label>
        <span className={`points ${isDoubled ? "doubled" : ""}`}>
          {currentPoints} pts {isDoubled && "(BÔNUS)"}
        </span>
      </div>

      <div className="input-col">
        <div className="input-group">
          <label>Preço R$:</label>
          <input
            type="number"
            step="0.01"
            min="0"
            id={`price-${item.id}`}
            placeholder="0.00"
            value={item.price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handlePriceChange(item.id, e.target.value)
            }
          />
        </div>
        <div className="input-group">
          <label>Qtd.:</label>
          <input
            type="number"
            step="1"
            min="0"
            id={`quantity-${item.id}`}
            placeholder="0"
            value={item.quantity}
            // Conversão para número antes de chamar a função
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleQuantityChange(item.id, parseInt(e.target.value) || 0)
            }
          />
        </div>
        <div>
          Total:{" "}
          {(Number(item?.price) * item.quantity).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </div>
      </div>

      <div className="result-col">
        <span className="pts-per-real">
          <span className="result">{ratio.toFixed(2)}</span> Pts/R$
        </span>
        <span className="total-points">
          Total: <strong>{totalPoints} pts</strong>
        </span>
        <span className="best-label">{isBestDeal && "✅ MELHOR NEGÓCIO!"}</span>
      </div>
    </div>
  );
};

// --- Componente Principal App ---
const App: React.FC = () => {
  const [items, setItems] = useState<IItem[]>(initialItemsData);
  const [bonusActive, setBonusActive] = useState<boolean>(false);
  const [bestDealId, setBestDealId] = useState<string | null>(null);
  const [grandTotalPoints, setGrandTotalPoints] = useState<number>(0);

  const calculateBestDeal = useCallback(
    (currentItems: IItem[], currentBonusActive: boolean) => {
      let bestRatio = -1;
      let newBestDealId: string | null = null;
      let runningTotalPoints = 0;

      const updatedItems = currentItems.map((item) => {
        const price = parseFloat(item.price);
        const quantity = item.quantity;
        const currentPoints =
          item.bonusItem && currentBonusActive ? item.points * 2 : item.points;
        let ratio = 0;

        // NOVO: Calcula total de pontos para a quantidade inserida
        const totalPoints = currentPoints * quantity;
        runningTotalPoints += totalPoints;

        // O ratio (Pts/R$) ainda é calculado baseado em 1 unidade
        if (price > 0 && !isNaN(price)) {
          ratio = currentPoints / price;
        }

        if (ratio > bestRatio) {
          bestRatio = ratio;
          newBestDealId = item.id;
        }
        return { ...item, ratio, totalPoints };
      });

      setItems(updatedItems);
      setBestDealId(newBestDealId);
      setGrandTotalPoints(runningTotalPoints); // Atualiza o total geral
    },
    [],
  );

  // Efeito para recalcular quando itens ou bônus mudam
  useEffect(() => {
    calculateBestDeal(items, bonusActive);
  }, [
    items.map((i) => `${i.price},${i.quantity}`).join(","),
    bonusActive,
    calculateBestDeal,
  ]); // Monitora preço E quantidade

  const handlePriceChange = (id: string, newPrice: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, price: newPrice } : item,
      ),
    );
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    // Garante que a quantidade não é negativa
    const safeQuantity = Math.max(0, newQuantity);
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: safeQuantity } : item,
      ),
    );
  };

  const toggleBonus = () => {
    setBonusActive((prev) => !prev);
  };

  // Agrupa os itens por categoria
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
      <h1>💰 Calculadora de Pontos por Custo</h1>
      <p>Insira o preço e a quantidade desejada de cada item.</p>

      <div className="controls">
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
          <React.Fragment key={category}>
            <div className="category-header">{category}</div>
            {categoryItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                handlePriceChange={handlePriceChange}
                handleQuantityChange={handleQuantityChange} // NOVO
                isBestDeal={item.id === bestDealId}
                bonusActive={bonusActive}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="grand-total">
        <h2>
          Total de Pontos Acumulados:{" "}
          <span className="final-score">{grandTotalPoints} pts</span>
        </h2>
      </div>
    </div>
  );
};

export default App;
