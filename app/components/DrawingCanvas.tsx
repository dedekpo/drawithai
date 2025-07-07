"use client";
import React, { useRef, useEffect, useState } from "react";

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onDrawingChange?: (imageData: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width = 600,
  height = 400,
  onDrawingChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);

  // Paleta de cores
  const colors = [
    "#000000", // Preto
    "#ef4444", // Vermelho
    "#f97316", // Laranja
    "#eab308", // Amarelo
    "#22c55e", // Verde
    "#06b6d4", // Ciano
    "#3b82f6", // Azul
    "#8b5cf6", // Roxo
    "#ec4899", // Rosa
    "#f59e0b", // Âmbar
    "#10b981", // Esmeralda
    "#6366f1", // Índigo
  ];

  // Função para salvar estado do canvas
  const saveCanvasState = () => {
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL();
      setCanvasHistory(prev => [...prev, imageData]);
    }
  };

  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = brushSize;
        
        // Preencher com fundo branco
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        
        setContext(ctx);
        
        // Salvar estado inicial após um pequeno delay
        setTimeout(() => {
          if (canvas) {
            const imageData = canvas.toDataURL();
            setCanvasHistory([imageData]);
          }
        }, 100);
      }
    }
  }, [width, height]);

  // Atualizar propriedades do contexto quando cor ou tamanho mudarem
  useEffect(() => {
    if (context) {
      context.strokeStyle = currentColor;
      context.lineWidth = brushSize;
    }
  }, [context, currentColor, brushSize]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      


      context.beginPath();
      context.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    if (!context || !isDrawing) return;
    
    setIsDrawing(false);
    context.closePath();    
    // Salvar estado APÓS completar o desenho
    saveCanvasState();    // Salvar estado APÓS completar o desenho
    saveCanvasState();    
    // Notificar componente pai sobre mudança no desenho
    if (onDrawingChange && canvasRef.current) {
      const imageData = canvasRef.current.toDataURL();
      onDrawingChange(imageData);
    }
  };

  const clearCanvas = () => {
    if (!context) return;

    saveCanvasState();
    context.fillStyle = "#ffffff";    
    // Salvar estado APÓS limpar
    saveCanvasState();    context.fillRect(0, 0, width, height);
    
    if (onDrawingChange) {
      onDrawingChange("");
    }
  };

  const undoLastAction = () => {
    if (canvasHistory.length > 1 && context && canvasRef.current) {
      // Remove o estado atual
      const newHistory = canvasHistory.slice(0, -1);
      setCanvasHistory(newHistory);
      
      // Restaura o estado anterior
      const previousState = newHistory[newHistory.length - 1];
      const img = new Image();
      img.onload = () => {
        context.clearRect(0, 0, width, height);
        context.drawImage(img, 0, 0);
        
        if (onDrawingChange) {
          onDrawingChange(canvasRef.current!.toDataURL());
        }
      };
      img.src = previousState;
    }
  };

  const changeColor = (color: string) => {
    setCurrentColor(color);
  };

  const changeBrushSize = (size: number) => {
    setBrushSize(size);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="border-2 border-slate-200 rounded-xl shadow-md bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="max-w-full rounded-xl"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Controles de Desenho */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
        
        {/* Paleta de Cores */}
        <div className="flex flex-col items-center">
          <label className="text-sm font-medium text-slate-600 mb-2">🎨 Cores</label>
          <div className="flex flex-wrap gap-2 justify-center max-w-xs">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => changeColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                  currentColor === color 
                    ? 'border-slate-400 ring-2 ring-slate-300' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                style={{ backgroundColor: color }}
                title={`Cor: ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Controle de Tamanho do Pincel */}
        <div className="flex flex-col items-center">
          <label className="text-sm font-medium text-slate-600 mb-2">🖌️ Pincel</label>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Fino</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => changeBrushSize(Number(e.target.value))}
              className="w-20 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs text-slate-500">Grosso</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Tamanho: {brushSize}px</div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={undoLastAction}
            disabled={canvasHistory.length <= 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
          >
            ↶ Desfazer
          </button>
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
          >
            🗑️ Limpar
          </button>
        </div>
      </div>

      {/* Indicador de Cor e Tamanho Atual */}
      <div className="flex items-center space-x-4 text-sm text-slate-600">
        <div className="flex items-center space-x-2">
          <span>Cor atual:</span>
          <div 
            className="w-6 h-6 rounded-full border-2 border-slate-300"
            style={{ backgroundColor: currentColor }}
          />
        </div>
        <div className="flex items-center space-x-2">
          <span>Pincel:</span>
          <div 
            className="rounded-full bg-slate-700"
            style={{ 
              width: `${Math.max(brushSize, 4)}px`, 
              height: `${Math.max(brushSize, 4)}px` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;