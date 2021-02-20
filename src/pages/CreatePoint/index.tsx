import React, { useState, useEffect, ChangeEvent, useRef, useMemo, useCallback } from "react";
import "./styles.css";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import logo from "../../assets/logo.svg";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import api from "../../services/api";
import axios from "axios";
import { LeafletMouseEvent } from "leaflet";

interface Item {
	id: number;
	title: string;
	image_url: string;
}

interface UF {
	name: string;
}

interface IBGEUFResponse {
	sigla: string;
}

interface IBGECityResponse {
	nome: string;
}

const CreatePoint = () => {
	const center:[number,number] = [-8.2648232, -35.9896734];
	const [items, setItems] = useState<Item[]>([]);
	const [ufs, setUfs] = useState<string[]>([]);
	const [cities, setCities] = useState<string[]>([]);
	const [selectedUf, setSelectedUf] = useState("0");
	const [selectedCity, setSelectedCity] = useState("0");
	const [initialPosition, setInitialPosition] = useState<[number, number]>(center);
	const [selectedPosition, setSelectedPosition] = useState<[number, number]>(center);

	const [draggable, setDraggable] = useState(true);
	const markerRef = useRef<any>(null);
	const eventHandlers = useMemo(
		() => ({
			dragend() {
				const marker = markerRef.current;
				if (marker != null) {
					setSelectedPosition(marker.getLatLng());
				}
			},
		}),
		[]
	);

	useEffect(() => {
		api.get("items").then((response) => {
			setItems(response.data);
		});
	}, []);

	useEffect(() => {
		axios
			.get<IBGEUFResponse[]>(
				"https://servicodados.ibge.gov.br/api/v1/localidades/estados"
			)
			.then((response) => {
				const ufInitials = response.data.map((uf) => uf.sigla);
				setUfs(ufInitials);
			});
	}, []);

	useEffect(() => {
		if (selectedUf === "0") {
			return;
		}

		axios
			.get<IBGECityResponse[]>(
				`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
			)
			.then((response) => {
				const cityNames = response.data.map((city) => city.nome);
				setCities(cityNames);
				console.log(response.data);
			});
	}, [selectedUf]);

	function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
		const uf = event.target.value;
		setSelectedUf(uf);
	}

	function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
		const city = event.target.value;
		setSelectedCity(city);
	}

	return (
		<div>
			<div id="page-create-point">
				<header>
					<img src={logo} alt="ecoleta" />

					<Link to="/">
						<FiArrowLeft /> Voltar para Home
					</Link>
				</header>

				<form>
					<h1>Cadastro do ponto de coleta</h1>

					<fieldset>
						<legend>
							<h2>Dados</h2>
						</legend>

						<div className="field">
							<label htmlFor="name">Nome da entidade</label>
							<input type="text" name="name" id="name" />
						</div>

						<div className="field-group">
							<div className="field">
								<label htmlFor="name">E-mail</label>
								<input type="email" name="email" id="email" />
							</div>
							<div className="field">
								<label htmlFor="name">WhatsApp</label>
								<input
									type="text"
									name="whatsapp"
									id="whatsapp"
								/>
							</div>
						</div>
					</fieldset>

					<fieldset>
						<legend>
							<h2>Endereço</h2>
							<span>Selecione o endereço no mapa</span>
						</legend>

						<MapContainer
							center={selectedPosition}
							zoom={15}
						>
							<TileLayer
								attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>

							<Marker
								draggable={draggable}
								eventHandlers={eventHandlers}
								position={selectedPosition}
								ref={markerRef}
							>
							</Marker>
						</MapContainer>

						<div className="field-group">
							<div className="field">
								<label htmlFor="uf">Estado (UF)</label>
								<select
									name="uf"
									id="uf"
									value={selectedUf}
									onChange={handleSelectUf}
								>
									<option value="0">Selecione uma UF</option>
									{ufs.map((uf) => (
										<option value={uf} key={uf}>
											{uf}
										</option>
									))}
								</select>
							</div>

							<div className="field">
								<label htmlFor="city">Cidade</label>
								<select
									name="city"
									id="city"
									value={selectedCity}
									onChange={handleSelectCity}
								>
									<option value="0">
										Selecione uma Cidade
									</option>
									{cities.map((city) => (
										<option value={city} key={city}>
											{city}
										</option>
									))}
								</select>
							</div>
						</div>
					</fieldset>

					<fieldset>
						<legend>
							<h2>Ítens de coleta</h2>
						</legend>

						<ul className="items-grid">
							{items.map((item) => {
								return (
									<li key={item.id}>
										<img
											src={item.image_url}
											alt={item.title}
										/>
										<span>{item.title}</span>
									</li>
								);
							})}
						</ul>
					</fieldset>

					<button type="submit">Cadastrar ponto de coleta</button>
				</form>
			</div>
		</div>
	);
};

export default CreatePoint;
