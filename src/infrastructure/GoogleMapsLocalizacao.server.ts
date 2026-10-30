import type { ILocalizacaoAdapter } from "@/domain/ports";
import type { ConsultaLocalizacao } from "@/lib/localizacao-ambiente";
import { dadosLocalizacao } from "@/lib/localizacao-ambiente";

type Geocode = { status?: string | undefined; results?: { partial_match?: boolean | undefined; address_components?: { long_name: string | undefined; types: string[] }[]; geometry?: { location_type?: string | undefined; location?: { lat: number | undefined; lng: number } } }[] };

export class GoogleMapsLocalizacao implements ILocalizacaoAdapter {
  constructor(private readonly apiKey: string, private readonly connectionKey: string | undefined) {}

  async consultar(respostas: Record<string, unknown>): Promise<ConsultaLocalizacao> {
    const dados = dadosLocalizacao(respostas);
    const limitacao = "O endereço e a rua da janela não comprovam sua orientação cardinal. Confirmar a fachada com bússola ou planta orientada; ventos, sombreamento e vazão de ar não foram medidos.";
    if (!dados.consultar) return { status: "nao_autorizado", limitacao };
    if (!dados.endereco || !this.connectionKey) return { status: "indisponivel", limitacao: `Consulta de localização indisponível. ${limitacao}` };
    try {
      const geocode = async (address: string): Promise<Geocode> => {
        const response = await fetch(`https://connector-gateway.lovable.dev/google_maps/maps/api/geocode/json?address=${encodeURIComponent(address)}`, {
          headers: { Authorization: `Bearer ${this.apiKey}`, "X-Connection-Api-Key": this.connectionKey ?? "" },
        });
        if (response.status === 403) throw new Error("Consulta Google Maps negada; verifique as permissões do serviço.");
        if (!response.ok) throw new Error(`Consulta Google Maps indisponível (${response.status}).`);
        return response.json();
      };
      // At most two calls per analysis, never on report reads. No shared address cache.
      const endereco = await geocode(dados.endereco);
      const resultado = endereco.results?.length === 1 ? endereco.results[0] : undefined;
      const ponto = resultado?.geometry?.location;
      if (endereco.status !== "OK" || resultado?.partial_match || !ponto || !Number.isFinite(ponto.lat) || !Number.isFinite(ponto.lng)
        || !["ROOFTOP", "RANGE_INTERPOLATED"].includes(resultado?.geometry?.location_type ?? "")) {
        return { status: "inconclusivo", limitacao: `Endereço não localizado com precisão suficiente. ${limitacao}` };
      }
      let ruaJanelaLocalizada = false;
      if (dados.ruaJanela) {
        // Locality context prevents a same-named street in another city being accepted.
        const contexto = resultado?.address_components?.filter(c => c.types.some(t => ["locality", "administrative_area_level_2", "administrative_area_level_1", "country"].includes(t))).map(c => c.long_name).join(", ");
        const rua = contexto ? await geocode(`${dados.ruaJanela}, ${contexto}`) : undefined;
        const ruaResultado = rua?.results?.length === 1 ? rua.results[0] : undefined;
        const ruaPonto = ruaResultado?.geometry?.location;
        ruaJanelaLocalizada = rua?.status === "OK" && !ruaResultado?.partial_match && !!ruaPonto
          && Math.abs(ruaPonto.lat - ponto.lat) < 0.01 && Math.abs(ruaPonto.lng - ponto.lng) < 0.01;
      }
      return { status: "localizado", latitude: ponto.lat, longitude: ponto.lng, ruaJanelaLocalizada,
        fonte: `https://www.google.com/maps/search/?api=1&query=${ponto.lat},${ponto.lng}`,
        consultadoEm: new Date().toISOString(), limitacao };
    } catch (error) {
      console.warn("[Localizacao]", error instanceof Error ? error.message : "Consulta indisponível");
      return { status: "indisponivel", limitacao: `Não foi possível consultar o mapa; análise baseada nas respostas. ${limitacao}` };
    }
  }
}