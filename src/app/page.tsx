"use client";
import { doc, updateDoc, writeBatch } from "firebase/firestore";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Minus, AlertTriangle } from "lucide-react";
import { db } from "@/app/Firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type Persona = {
  id: string;
  Nombre: string;
  GroseriasLeves: number;
  GroseriasFuertes: number;
  FotoUrl: string;
};

export default function Component() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    const fetchPersonas = async () => {
      const personasCollection = collection(db, "usuarios");
      const personasSnapshot = await getDocs(personasCollection);
      const personasList = personasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        FotoUrl: doc.data().fotoUrl || '/placeholder.svg',
      })) as Persona[];
      setPersonas(personasList);
    };

    fetchPersonas();
  }, []);

  const calcularTotal = () => {
    return personas.reduce((total, persona) => {
      return total + persona.GroseriasLeves * 200 + persona.GroseriasFuertes * 500;
    }, 0);
  };

  const actualizarMultasEnFirestore = async (id: string, tipo: "leves" | "fuertes", operacion: "sumar" | "restar") => {
    const personaRef = doc(db, "usuarios", id);
    const campo = tipo === "leves" ? "GroseriasLeves" : "GroseriasFuertes";
    const personaActualizada = personas.find(persona => persona.id === id);
    
    if (personaActualizada) {
      const nuevoValor = operacion === "sumar" ? personaActualizada[campo] + 1 : Math.max(0, personaActualizada[campo] - 1);

      await updateDoc(personaRef, {
        [campo]: nuevoValor
      });

      setPersonas(personas.map((persona) => {
        if (persona.id === id) {
          return { ...persona, [campo]: nuevoValor };
        }
        return persona;
      }));
    }
  };

  const reiniciarGroserias = () => {
    setIsDialogOpen(true);
  };

  const confirmarReinicio = async () => {
    const batch = writeBatch(db);

    personas.forEach(persona => {
      const personaRef = doc(db, "usuarios", persona.id);
      batch.update(personaRef, {
        GroseriasLeves: 0,
        GroseriasFuertes: 0
      });
    });

    await batch.commit();
    setConfirmationMessage("El pizarrón ha sido reiniciado exitosamente.");

    setPersonas(personas.map(persona => ({
      ...persona,
      GroseriasLeves: 0,
      GroseriasFuertes: 0
    })));

    setTimeout(() => {
      setIsDialogOpen(false);
      setConfirmationMessage('');
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Pizarrón de Multas por Groserías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personas.map((persona) => (
              <Card key={persona.id} className="flex flex-col">
                <CardContent className="flex items-center space-x-4 p-4">
                  <Avatar className="w-12 h-12">
                  <AvatarImage
                    src="https://staticnew-prod.topdoctors.cl/provider/111400/image/profile/medium/clinica-davila-1664821372"
                    alt={persona.Nombre}
                    onError={(e) => (e.target as HTMLImageElement).src = '/placeholder.svg'}
                  />
                    <AvatarFallback>{persona.Nombre.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{persona.Nombre}</h3>

                    {/* Mostrar total de multas para cada usuario */}
                    <div className="text-md font-medium mt-2 text-gray-700">
                      Total: ${persona.GroseriasLeves * 200 + persona.GroseriasFuertes * 500}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-blue-500">Leves: ${persona.GroseriasLeves * 200}</span>
                      <div className="flex space-x-1">
                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => actualizarMultasEnFirestore(persona.id, 'leves', 'restar')}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-6 w-6 bg-blue-100" onClick={() => actualizarMultasEnFirestore(persona.id, 'leves', 'sumar')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-red-500">Fuertes: ${persona.GroseriasFuertes * 500}</span>
                      <div className="flex space-x-1">
                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => actualizarMultasEnFirestore(persona.id, 'fuertes', 'restar')}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-6 w-6 bg-red-100" onClick={() => actualizarMultasEnFirestore(persona.id, 'fuertes', 'sumar')}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button variant="destructive" onClick={reiniciarGroserias} className="px-4 py-2">
            Reiniciar Pizarrón
          </Button>
          <div className="text-xl font-bold">
            Total Recaudado: ${calcularTotal().toLocaleString()}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Reinicio</DialogTitle>
            <DialogDescription>
              {confirmationMessage ? (
                confirmationMessage
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 text-yellow-500 inline-block mr-2" />
                  ¿Estás seguro de que quieres borrar el pizarrón? Esta acción no se puede deshacer.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {!confirmationMessage && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmarReinicio}>Confirmar Reinicio</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
