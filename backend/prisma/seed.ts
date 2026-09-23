import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.turno.upsert({
    where: { codigo: "T1" },
    update: {},
    create: {
      codigo: "T1",
      nome: "Turno 1",
      horaInicio: "06:00",
      horaFim: "14:00",
    },
  });

  await prisma.turno.upsert({
    where: { codigo: "T2" },
    update: {},
    create: {
      codigo: "T2",
      nome: "Turno 2",
      horaInicio: "14:00",
      horaFim: "22:00",
    },
  });

  const motivos = [
    { codigo: "CAIU_CHAO", nome: "Caiu no chão" },
    { codigo: "AZEDOU", nome: "Azedou" },
    { codigo: "RACHOU", nome: "Rachou" },
    { codigo: "DURO", nome: "Duro" },
    { codigo: "NAO_VENDEU", nome: "Não vendeu" },
  ];

  for (const motivo of motivos) {
    await prisma.motivoPerda.upsert({
      where: { codigo: motivo.codigo },
      update: { nome: motivo.nome },
      create: motivo,
    });
  }

  const produtos = [
    { nome: "Salgado", categoria: "Salgado", custoUnitario: 4.11 },
    { nome: "Torta", categoria: "Torta", custoUnitario: 5.81 },
    { nome: "Palito", categoria: "Palito", custoUnitario: 2.68 },
    { nome: "Pão de Queijo", categoria: "Pão de Queijo", custoUnitario: 1.66 },
    { nome: "Coxinha", categoria: "Salgado", custoUnitario: 4.11 },
    { nome: "Risoles", categoria: "Salgado", custoUnitario: 4.11 },
    { nome: "Empada", categoria: "Torta", custoUnitario: 5.81 },
  ];

  for (const produto of produtos) {
    const existente = await prisma.produto.findFirst({
      where: { nome: produto.nome },
    });
    if (!existente) {
      await prisma.produto.create({ data: { ...produto, unidade: "un" } });
    }
  }

  console.log("Seed concluído.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
