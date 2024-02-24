package com.github.matteo099.resources;

import org.jboss.logging.Logger;

import com.github.matteo099.model.dao.DieDao;
import com.github.matteo099.model.dao.DieSimilarSearchDao;
import com.github.matteo099.model.wrappers.ErrorWrapper;
import com.github.matteo099.model.wrappers.IdWrapper;
import com.github.matteo099.services.DieService;

import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/v1/die-controller")
public class DieResource {

    @Inject
    DieService dieService;

    @Inject
    Logger logger;

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/search-similar-dies")
    public Response searchSimilarDies(DieSimilarSearchDao dieSimilarSearchDao,
            @QueryParam("threshold") @DefaultValue("1000.0") Float threshold) {
        try {
            logger.info("searching similar dies " + threshold);
            var similarDies = dieService.searchSimilarDies(dieSimilarSearchDao, threshold);
            return Response.ok().entity(similarDies).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/create-die")
    public Response createDie(DieDao die) {
        try {
            logger.info("creating die");
            Long id = dieService.createDie(die);
            return Response.ok().entity(IdWrapper.of(id)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/list-dies")
    public Response listDies() {
        try {
            logger.info("listing dies");
            var dies = dieService.listDies();
            logger.info(dies.size());
            return Response.ok().entity(dies).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/die/{id}")
    public Response getDie(@PathParam("id") Long id) {
        try {
            logger.info("finding die with id " + id);
            return Response.ok().entity(dieService.findDie(id).orElseThrow()).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }
}
