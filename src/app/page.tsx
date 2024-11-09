"use client";
import { doc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { db } from "@/app/Firebase/firebaseConfig";  // Importa la configuración de Firebase
import { collection, getDocs } from "firebase/firestore";

type Persona = {
  id: string;
  Nombre: string;
  GroseriasLeves: number;
  GroseriasFuertes: number;
  FotoUrl: string;
};

export default function Component() {
  const [personas, setPersonas] = useState<Persona[]>([]);

  {/* Cargar datos desde Firestore cuando se monta el componente */}
  useEffect(() => {
    const fetchPersonas = async () => {
      const personasCollection = collection(db, "usuarios");
      const personasSnapshot = await getDocs(personasCollection);
      const personasList = personasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        FotoUrl: doc.data().fotoUrl || '/placeholder.svg',  // Usa el archivo placeholder.svg si no hay foto
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
    const personaRef = doc(db, "usuarios", id); // Referencia al documento del usuario en Firestore

    {/* Obtén el campo y el valor actual*/}
    const campo = tipo === "leves" ? "GroseriasLeves" : "GroseriasFuertes";
    const personaActualizada = personas.find(persona => persona.id === id);
    
    if (personaActualizada) {
      const nuevoValor = operacion === "sumar" ? personaActualizada[campo] + 1 : Math.max(0, personaActualizada[campo] - 1);

      {/* Actualizar Firestore */}
      await updateDoc(personaRef, {
        [campo]: nuevoValor
      });

      {/* Actualiza el estado local para reflejar el cambio en la interfaz*/}
      setPersonas(personas.map((persona) => {
        if (persona.id === id) {
          return { ...persona, [campo]: nuevoValor };
        }
        return persona;
      }));
    }
  };

  return (
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

                <AvatarFallback>{persona.Nombre.charAt(0)}</AvatarFallback>  // Primer letra del nombre
              </Avatar>


                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{persona.Nombre}</h3>
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
      <CardFooter className="flex justify-end">
        <div className="text-xl font-bold">
          Total Recaudado: ${calcularTotal().toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  );
}
