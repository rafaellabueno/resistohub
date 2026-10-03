export const AtivosTable = ({ title }: { title: string }) => {
  return (
    <div className="w-full">
      <div className="w-full">
        <div className="container">
          <p className="p-2 py-3">{title}</p>
          <div className="hide-scrollbar overflow-x-auto shadow-md">
            <table className="w-full table-auto bg-secondary shadow-md dark:text-white md:table-fixed">
              <thead>
                <tr className=" bg-[#3cbbd2] text-left text-white">
                  <th className="rounded-tl p-2">Compra</th>
                  <th>Data da compra</th>
                  <th>Valor inicial</th>
                  <th>Data vcto.</th>
                  <th>Ganho mês</th>
                  <th>Saldo</th>
                  <th className="rounded-tr">Acumulado </th>
                </tr>
              </thead>
              <tbody className="">
                <tr className="">
                  <td className="p-2">01/03/2023</td>
                  <td>R$ 10.000,00</td>
                  <td>10/03/2023</td>
                  <td>R$ 1.000,00</td>
                  <td>R$ 15.000,00</td>
                  <td>R$ 5.000,00</td>
                  <td>R$ 5.000,00</td>
                </tr>
                <tr className="">
                  <td className="p-2">01/03/2023</td>
                  <td>R$ 10.000,00</td>
                  <td>10/03/2023</td>
                  <td>R$ 1.000,00</td>
                  <td>R$ 15.000,00</td>
                  <td>R$ 5.000,00</td>
                  <td>R$ 5.000,00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export const CyclesTableFixed = ({}) => {
  return (
    <div className="my-5 h-fit w-full overflow-x-scroll rounded-md border-b-0 bg-white p-3 shadow dark:border-zinc-700 dark:bg-zinc-700 md:overflow-x-auto">
      <table className="w-full table-auto px-4 text-left">
        <thead>
          <tr>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="p-2" />
              Todos
            </label>
            <th>Produto</th>
            <th>Inciio ciclo</th>
            <th>Termino ciclo</th>
            <th>Periodicidade</th>
          </tr>
        </thead>
      </table>
    </div>
  )
}

export const CyclesTableVariable = ({}) => {
  return (
    <div className="my-5 h-fit w-full overflow-x-scroll rounded-md border-b-0 bg-white p-3 shadow dark:border-zinc-700 dark:bg-zinc-700 md:overflow-x-auto">
      <table className="w-full table-auto px-4 text-left">
        <thead>
          <tr>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="p-2" />
              Todos
            </label>
            <th>Produto</th>
            <th>Inciio ciclo</th>
            <th>Termino ciclo</th>
            <th>Periodicidade</th>
          </tr>
        </thead>
      </table>
    </div>
  )
}
