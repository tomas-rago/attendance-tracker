import { Accordion, AccordionItem } from '../components/ui/Accordion';
import {
  CoursesConfig,
  ClassesConfig,
  StudentsConfig,
  ScheduleConfig,
  DataExport,
} from '../components/config';

export function ConfigPage() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h2>

      <Accordion>
        <AccordionItem title="Cursos" defaultOpen>
          <CoursesConfig />
        </AccordionItem>

        <AccordionItem title="Materias">
          <ClassesConfig />
        </AccordionItem>

        <AccordionItem title="Alumnos">
          <StudentsConfig />
        </AccordionItem>

        <AccordionItem title="Horario">
          <ScheduleConfig />
        </AccordionItem>

        <AccordionItem title="Exportar / Importar datos">
          <DataExport />
        </AccordionItem>
      </Accordion>
    </div>
  );
}
